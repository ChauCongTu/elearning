<?php

namespace App\Contracts\Content;

interface SiteContentServiceInterface
{
    /**
     * @return array<string, mixed>
     */
    public function all(): array;
}
