<?php

namespace App\Contracts\Admin;

use App\Models\Category;

interface AdminCategoryServiceInterface
{
    /**
     * @return list<array<string, mixed>>
     */
    public function listForAdmin(): array;

    public function create(array $data): array;

    public function update(Category $category, array $data): array;

    public function delete(Category $category): void;
}
