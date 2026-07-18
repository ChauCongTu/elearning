<?php

namespace App\Contracts\Admin;

use App\Models\PostCategory;

interface AdminPostCategoryServiceInterface
{
    /**
     * @return list<array<string, mixed>>
     */
    public function listForAdmin(): array;

    public function create(array $data): array;

    public function update(PostCategory $category, array $data): array;

    public function delete(PostCategory $category): void;
}
