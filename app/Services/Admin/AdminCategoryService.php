<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminCategoryServiceInterface;
use App\Models\Category;
use App\Support\SlugGenerator;

class AdminCategoryService implements AdminCategoryServiceInterface
{
    public function listForAdmin(): array
    {
        return Category::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get()
            ->map(fn (Category $category) => $this->toArray($category))
            ->all();
    }

    public function create(array $data): array
    {
        $category = Category::create([
            'name' => $data['name'],
            'slug' => $data['slug'] ?? SlugGenerator::unique($data['name'], Category::class),
            'parent_id' => $data['parent_id'] ?? null,
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return $this->toArray($category);
    }

    public function update(Category $category, array $data): array
    {
        $category->fill([
            'name' => $data['name'] ?? $category->name,
            'slug' => $data['slug'] ?? $category->slug,
            'parent_id' => array_key_exists('parent_id', $data) ? $data['parent_id'] : $category->parent_id,
            'sort_order' => $data['sort_order'] ?? $category->sort_order,
            'is_active' => $data['is_active'] ?? $category->is_active,
        ]);

        if (isset($data['name']) && ! isset($data['slug'])) {
            $category->slug = SlugGenerator::unique($data['name'], Category::class, $category->id);
        }

        $category->save();

        return $this->toArray($category->fresh());
    }

    public function delete(Category $category): void
    {
        $category->delete();
    }

    /**
     * @return array<string, mixed>
     */
    private function toArray(Category $category): array
    {
        return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'parent_id' => $category->parent_id,
            'sort_order' => $category->sort_order,
            'is_active' => $category->is_active,
            'courses_count' => $category->primaryCourses()->count(),
        ];
    }
}
