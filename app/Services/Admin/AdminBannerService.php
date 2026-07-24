<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminBannerServiceInterface;
use App\Contracts\Files\FileServiceInterface;
use App\Enums\FilePrefix;
use App\Models\Banner;
use Illuminate\Http\UploadedFile;

class AdminBannerService implements AdminBannerServiceInterface
{
    public function __construct(
        private FileServiceInterface $files,
    ) {}

    public function listForAdmin(): array
    {
        return Banner::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Banner $banner) => $this->toArray($banner))
            ->all();
    }

    public function create(array $data): array
    {
        $banner = Banner::create([
            'title' => $data['title'],
            'image_path' => $data['image_path'],
            'link_url' => $data['link_url'] ?? null,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
            'starts_at' => $data['starts_at'] ?? null,
            'ends_at' => $data['ends_at'] ?? null,
        ]);

        return $this->toArray($banner);
    }

    public function update(Banner $banner, array $data): array
    {
        $banner->fill([
            'title' => $data['title'] ?? $banner->title,
            'image_path' => $data['image_path'] ?? $banner->image_path,
            'link_url' => array_key_exists('link_url', $data) ? $data['link_url'] : $banner->link_url,
            'sort_order' => $data['sort_order'] ?? $banner->sort_order,
            'is_active' => $data['is_active'] ?? $banner->is_active,
            'starts_at' => array_key_exists('starts_at', $data) ? $data['starts_at'] : $banner->starts_at,
            'ends_at' => array_key_exists('ends_at', $data) ? $data['ends_at'] : $banner->ends_at,
        ]);
        $banner->save();

        return $this->toArray($banner->fresh());
    }

    public function delete(Banner $banner): void
    {
        $this->files->delete($banner->image_path);
        $banner->delete();
    }

    public function storeImage(Banner $banner, UploadedFile $file): Banner
    {
        $path = $this->files->replace($file, FilePrefix::Banner, $banner->image_path);
        $banner->update(['image_path' => $path]);

        return $banner->fresh();
    }

    /**
     * @return array<string, mixed>
     */
    private function toArray(Banner $banner): array
    {
        return [
            'id' => $banner->id,
            'title' => $banner->title,
            'image_path' => $banner->image_path,
            'image_url' => $banner->image_url,
            'link_url' => $banner->link_url,
            'sort_order' => $banner->sort_order,
            'is_active' => $banner->is_active,
            'starts_at' => $banner->starts_at?->toIso8601String(),
            'ends_at' => $banner->ends_at?->toIso8601String(),
        ];
    }
}
