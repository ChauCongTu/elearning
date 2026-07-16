<?php

namespace App\Services\Content;

use App\Contracts\Content\PostCategoryServiceInterface;
use App\Models\PostCategory;
use Illuminate\Database\Eloquent\Collection;

class PostCategoryService implements PostCategoryServiceInterface
{
    /**
     * @return Collection<int, PostCategory>
     */
    public function listActive(): Collection
    {
        return PostCategory::query()
            ->active()
            ->get(['id', 'name', 'slug', 'description']);
    }
}
