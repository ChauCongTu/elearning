<?php

namespace App\Contracts\Content;

interface SitemapServiceInterface
{
    public function render(): string;
}
