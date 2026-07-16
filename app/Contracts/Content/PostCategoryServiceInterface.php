<?php

namespace App\Contracts\Content;

use App\Models\PostCategory;
use Illuminate\Database\Eloquent\Collection;

interface PostCategoryServiceInterface
{
    /**
     * @return Collection<int, PostCategory>
     */
    public function listActive(): Collection;
}
