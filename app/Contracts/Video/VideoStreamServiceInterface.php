<?php

namespace App\Contracts\Video;

use App\Models\Lesson;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

interface VideoStreamServiceInterface
{
    public function signedUrl(Lesson $lesson): ?string;

    public function stream(Lesson $lesson, ?string $rangeHeader): StreamedResponse;

    /**
     * @return array{upload_url: string, video_s3_key: string, headers: array<string, string>, method: string}
     */
    public function presignedUpload(Lesson $lesson, string $contentType): array;
}
