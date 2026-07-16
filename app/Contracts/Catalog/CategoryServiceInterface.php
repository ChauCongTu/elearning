<?php

namespace App\Contracts\Catalog;

use App\Models\Category;
use Illuminate\Database\Eloquent\Collection;

interface CategoryServiceInterface
{
    /**
     * @return Collection<int, Category>
     */
    public function listActive(): Collection;
}
