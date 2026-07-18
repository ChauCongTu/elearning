<?php

namespace App\Contracts\Video;

use App\Models\Lesson;

interface VideoStreamServiceInterface
{
    public function signedUrl(Lesson $lesson): ?string;

    /**
     * @return array{upload_url: string, video_s3_key: string, headers: array<string, string>, method: string}
     */
    public function presignedUpload(Lesson $lesson, string $contentType): array;
}
