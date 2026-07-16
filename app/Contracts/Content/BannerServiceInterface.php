<?php

namespace App\Contracts\Content;

use App\Models\Banner;
use Illuminate\Database\Eloquent\Collection;

interface BannerServiceInterface
{
    /**
     * @return Collection<int, Banner>
     */
    public function listActive(): Collection;
}
