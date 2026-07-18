<?php

namespace App\Services\Video;

use App\Contracts\Video\VideoStreamServiceInterface;
use App\Enums\FilePrefix;
use App\Models\Lesson;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

    private function disk(): string
    {
        return (string) config('video.disk', 's3');
    }

    private function signedUrlTtlMinutes(): int
    {
        return (int) config('video.signed_url_ttl_minutes', 120);
    }
}
