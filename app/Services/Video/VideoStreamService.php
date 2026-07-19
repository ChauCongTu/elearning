<?php

namespace App\Services\Video;

use App\Contracts\Video\VideoStreamServiceInterface;
use App\Enums\FilePrefix;
use App\Models\Lesson;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class VideoStreamService implements VideoStreamServiceInterface
{
    public function signedUrl(Lesson $lesson): ?string
    {
        $key = $lesson->video_s3_key;

        if ($key === null || $key === '') {
            return null;
        }

        $disk = $this->disk();

        if (! Storage::disk($disk)->exists($key)) {
            return null;
        }

        if ($disk === 's3') {
            return Storage::disk($disk)->temporaryUrl(
                $key,
                now()->addMinutes($this->signedUrlTtlMinutes()),
            );
        }

        return Storage::disk($disk)->url($key);
    }

    public function stream(Lesson $lesson, ?string $rangeHeader): StreamedResponse
    {
        $key = $lesson->video_s3_key;

        if ($key === null || $key === '') {
            abort(404);
        }

        $diskName = $this->disk();
        $disk = Storage::disk($diskName);

        if (! $disk->exists($key)) {
            abort(404);
        }

        $size = $disk->size($key);
        [$start, $end, $length] = $this->parseByteRange($rangeHeader, $size);
        $isPartial = $rangeHeader !== null && str_starts_with($rangeHeader, 'bytes=');
        $status = $isPartial ? 206 : 200;

        $headers = [
            'Content-Type' => $disk->mimeType($key) ?: 'video/mp4',
            'Content-Disposition' => 'inline; filename="lesson.bin"',
            'Accept-Ranges' => 'bytes',
            'Content-Length' => (string) $length,
            'Cache-Control' => 'no-store, no-cache, must-revalidate, private',
            'Pragma' => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
        ];

        if ($isPartial) {
            $headers['Content-Range'] = "bytes {$start}-{$end}/{$size}";
        }

        if ($this->shouldStreamViaS3Client($diskName, $disk)) {
            return $this->streamViaS3Client($disk, $key, $start, $end, $status, $headers);
        }

        return response()->stream(function () use ($disk, $key, $start, $length) {
            $stream = $disk->readStream($key);

            if ($stream === false) {
                return;
            }

            if ($start > 0) {
                fseek($stream, $start);
            }

            $remaining = $length;

            while ($remaining > 0 && ! feof($stream)) {
                $chunk = fread($stream, min(8192, $remaining));

                if ($chunk === false) {
                    break;
                }

                echo $chunk;
                $remaining -= strlen($chunk);
            }

            fclose($stream);
        }, $status, $headers);
    }

    public function presignedUpload(Lesson $lesson, string $contentType): array
    {
        $disk = $this->disk();

        if ($disk !== 's3') {
            throw new \RuntimeException('Presigned upload chỉ hỗ trợ disk S3.');
        }

        $extension = match (true) {
            str_contains($contentType, 'webm') => 'webm',
            str_contains($contentType, 'quicktime') => 'mov',
            default => 'mp4',
        };

        $key = trim(FilePrefix::LessonVideo->value, '/').'/'.$lesson->id.'-'.Str::uuid().'.'.$extension;

        $expiresAt = now()->addMinutes((int) config('video.upload_url_ttl_minutes', 30));

        $upload = Storage::disk($disk)->temporaryUploadUrl(
            $key,
            $expiresAt,
            ['ContentType' => $contentType],
        );

        return [
            'upload_url' => $upload['url'],
            'video_s3_key' => $key,
            'headers' => $upload['headers'] ?? [],
            'method' => 'PUT',
        ];
    }

    /**
     * @return array{0: int, 1: int, 2: int}
     */
    private function parseByteRange(?string $rangeHeader, int $size): array
    {
        if ($size <= 0) {
            return [0, 0, 0];
        }

        if ($rangeHeader === null || ! str_starts_with($rangeHeader, 'bytes=')) {
            return [0, $size - 1, $size];
        }

        [$startPart, $endPart] = array_pad(explode('-', substr($rangeHeader, 6), 2), 2, '');

        $start = $startPart === '' ? 0 : (int) $startPart;
        $end = $endPart === '' ? $size - 1 : (int) $endPart;
        $end = min($end, $size - 1);

        if ($start > $end) {
            abort(416);
        }

        return [$start, $end, $end - $start + 1];
    }

    private function shouldStreamViaS3Client(string $diskName, $disk): bool
    {
        if ($diskName !== 's3') {
            return false;
        }

        try {
            $disk->getClient();

            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    /**
     * @param  \Illuminate\Contracts\Filesystem\Filesystem  $disk
     * @param  array<string, string>  $headers
     */
    private function streamViaS3Client($disk, string $key, int $start, int $end, int $status, array $headers): StreamedResponse
    {
        $client = $disk->getClient();
        $bucket = (string) config('filesystems.disks.s3.bucket');

        $params = [
            'Bucket' => $bucket,
            'Key' => $key,
        ];

        if ($status === 206) {
            $params['Range'] = "bytes={$start}-{$end}";
        }

        $result = $client->getObject($params);

        return response()->stream(function () use ($result) {
            $body = $result['Body'];

            while (! $body->eof()) {
                echo $body->read(8192);
            }
        }, $status, $headers);
    }

    private function disk(): string
    {
        return (string) config('video.disk', 's3');
    }

    private function signedUrlTtlMinutes(): int
    {
        return (int) config('video.signed_url_ttl_minutes', 120);
    }
}
