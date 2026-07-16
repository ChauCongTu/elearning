<?php

namespace App\Contracts\Content;

use Illuminate\Database\Eloquent\Collection;

interface HomePageServiceInterface
{
    /**
     * @return array{
     *     banners: Collection,
     *     enrollmentCourses: Collection,
     *     featuredCourses: Collection,
     *     latestCourses: Collection,
     *     categories: Collection,
     *     siteContent: array<string, mixed>,
     *     articleSections: list<array<string, mixed>>,
     * }
     */
    public function getData(): array;
}
