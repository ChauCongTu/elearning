<?php

namespace App\Contracts\Admin;

use App\Models\Banner;

interface AdminBannerServiceInterface
{
    /**
     * @return list<array<string, mixed>>
     */
    public function listForAdmin(): array;

    public function create(array $data): array;

    public function update(Banner $banner, array $data): array;

    public function delete(Banner $banner): void;
}
