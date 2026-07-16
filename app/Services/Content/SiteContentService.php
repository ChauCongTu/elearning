<?php

namespace App\Services\Content;

use App\Contracts\Content\SiteContentServiceInterface;
use App\Contracts\Content\SiteSettingsServiceInterface;

class SiteContentService implements SiteContentServiceInterface
{
    public function __construct(
        private SiteSettingsServiceInterface $siteSettings,
    ) {}

    public function all(): array
    {
        return $this->siteSettings->contentForPages();
    }
}
