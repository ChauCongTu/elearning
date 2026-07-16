<?php

namespace App\Services\Catalog;

use App\Contracts\Catalog\CategoryServiceInterface;
use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

class CategoryService implements CategoryServiceInterface
{
    /**
     * @return Collection<int, Category>
     */
    public function listActive(): Collection
    {
        return Category::query()
            ->active()
            ->get(['id', 'name', 'slug']);
    }
}
