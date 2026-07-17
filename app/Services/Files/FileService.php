<?php

namespace App\Services\Files;

use App\Contracts\Files\FileServiceInterface;
use App\Enums\FilePrefix;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FileService implements FileServiceInterface
{
    public function disk(): string
    {
        return (string) config('filesystems.upload_disk', 'public');
    }

    public function upload(UploadedFile $file, FilePrefix $prefix): string
    {
        $directory = $this->normalizePrefix($prefix);

        Storage::disk($this->disk())->makeDirectory($directory);

        return $file->store($directory, $this->disk());
    }

    public function replace(UploadedFile $file, FilePrefix $prefix, ?string $existingPath = null): string
    {
        $this->delete($existingPath);

        return $this->upload($file, $prefix);
    }

    public function delete(?string $path): bool
    {
        if (! $this->isManagedPath($path)) {
            return false;
        }

        return Storage::disk($this->disk())->delete($path);
    }

    public function url(?string $path): ?string
    {
        if ($path === null || $path === '') {
            return null;
        }

        if (Str::startsWith($path, ['http://', 'https://'])) {
            return $path;
        }

        if (Str::startsWith($path, 'images/')) {
            return asset($path);
        }

        return Storage::disk($this->disk())->url($path);
    }

    public function exists(?string $path): bool
    {
        if (! $this->isManagedPath($path)) {
            return false;
        }

        return Storage::disk($this->disk())->exists($path);
    }

    private function normalizePrefix(FilePrefix $prefix): string
    {
        return trim($prefix->value, '/');
    }

    private function isManagedPath(?string $path): bool
    {
        if ($path === null || $path === '') {
            return false;
        }

        if (Str::startsWith($path, ['http://', 'https://', 'images/'])) {
            return false;
        }

        return true;
    }
}
