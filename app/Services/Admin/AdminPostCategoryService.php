<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminPostCategoryServiceInterface;
use App\Models\PostCategory;
use App\Support\SlugGenerator;

class AdminPostCategoryService implements AdminPostCategoryServiceInterface
{
    public function listForAdmin(): array
    {
        return PostCategory::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (PostCategory $category) => $this->toArray($category))
            ->all();
    }

    public function create(array $data): array
    {
        $category = PostCategory::create([
            'name' => $data['name'],
            'slug' => $data['slug'] ?? SlugGenerator::unique($data['name'], PostCategory::class),
            'description' => $data['description'] ?? null,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return $this->toArray($category);
    }

    public function update(PostCategory $category, array $data): array
    {
        $category->fill([
            'name' => $data['name'] ?? $category->name,
            'slug' => $data['slug'] ?? $category->slug,
            'description' => array_key_exists('description', $data) ? $data['description'] : $category->description,
            'sort_order' => $data['sort_order'] ?? $category->sort_order,
            'is_active' => $data['is_active'] ?? $category->is_active,
        ]);

        if (isset($data['name']) && ! isset($data['slug'])) {
            $category->slug = SlugGenerator::unique($data['name'], PostCategory::class, $category->id);
        }

        $category->save();

        return $this->toArray($category->fresh());
    }

    public function delete(PostCategory $category): void
    {
        $category->delete();
    }

    /**
     * @return array<string, mixed>
     */
    private function toArray(PostCategory $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
            'sort_order' => $category->sort_order,
            'is_active' => $category->is_active,
            'posts_count' => $category->posts()->count(),
        ];
    }
}
