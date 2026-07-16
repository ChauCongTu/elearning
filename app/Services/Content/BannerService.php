<?php

namespace App\Services\Content;

use App\Contracts\Content\BannerServiceInterface;
use App\Models\Banner;
use Illuminate\Database\Eloquent\Collection;

class BannerService implements BannerServiceInterface
{
    /**
     * @return Collection<int, Banner>
     */
    public function listActive(): Collection
    {
        return Banner::query()
            ->active()
            ->get(['id', 'title', 'image_path', 'link_url']);
    }
}
