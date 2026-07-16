<?php

namespace App\Contracts\Catalog;

use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;

interface CourseCatalogServiceInterface
{
    /**
     * @param  array{q?: string, category?: string, sort?: string}  $filters
     * @return Collection<int, Course>
     */
    public function listForCatalog(array $filters): Collection;

    public function findPublishedBySlug(string $slug): Course;

    /**
     * @return Collection<int, Course>
     */
    public function listEnrollmentCourses(): Collection;

    /**
     * @return Collection<int, Course>
     */
    public function listFeaturedCourses(int $limit = 6): Collection;

    /**
     * @return Collection<int, Course>
     */
    public function listLatestCourses(int $limit = 3): Collection;

    /**
     * @return Collection<int, Course>
     */
    public function listForPricing(): Collection;
}
