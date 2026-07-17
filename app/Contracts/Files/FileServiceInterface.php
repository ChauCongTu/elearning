<?php

namespace App\Contracts\Files;

use App\Enums\FilePrefix;
use Illuminate\Http\UploadedFile;

interface FileServiceInterface
{
    public function disk(): string;

    public function upload(UploadedFile $file, FilePrefix $prefix): string;

    public function replace(UploadedFile $file, FilePrefix $prefix, ?string $existingPath = null): string;

    public function delete(?string $path): bool;

    public function url(?string $path): ?string;

    public function exists(?string $path): bool;
}
