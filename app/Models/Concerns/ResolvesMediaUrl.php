<?php

namespace App\Models\Concerns;

use App\Contracts\Files\FileServiceInterface;

trait ResolvesMediaUrl
{
    protected function resolveMediaUrl(?string $path): ?string
    {
        return app(FileServiceInterface::class)->url($path);
    }
}
