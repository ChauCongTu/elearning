<?php

namespace App\Services\Catalog;

use App\Contracts\Catalog\CourseCatalogServiceInterface;
use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;

class CourseCatalogService implements CourseCatalogServiceInterface
{
    /**
     * @param  array{q?: string, category?: string, sort?: string}  $filters
     * @return Collection<int, Course>
     */
    public function listForCatalog(array $filters): Collection
    {
        $search = trim($filters['q'] ?? '');
        $categorySlug = trim($filters['category'] ?? '');
        $sort = $filters['sort'] ?? 'latest';

        $query = Course::query()
            ->published()
            ->withPurchaseCount()
            ->with('category:id,name,slug');

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder
                    ->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        if ($categorySlug !== '') {
            $query->whereHas('category', fn ($category) => $category->where('slug', $categorySlug));
        }

        match ($sort) {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default => $query->orderByDesc('is_featured')->orderByDesc('published_at'),
        };

        return $query->get($this->indexFields());
    }

    public function findPublishedBySlug(string $slug): Course
    {
        return Course::query()
            ->where('slug', $slug)
            ->published()
            ->withPurchaseCount()
            ->with([
                'category:id,name,slug',
                'chapters' => fn ($query) => $query
                    ->where('is_published', true)
                    ->orderBy('sort_order'),
                'chapters.lessons' => fn ($query) => $query
                    ->where('is_published', true)
                    ->orderBy('sort_order')
                    ->select([
                        'id',
                        'chapter_id',
                        'title',
                        'sort_order',
                        'duration_seconds',
                        'is_free_preview',
                    ]),
            ])
            ->firstOrFail();
    }

    /**
     * @return Collection<int, Course>
     */
    public function listEnrollmentCourses(): Collection
    {
        return Course::query()
            ->published()
            ->withPurchaseCount()
            ->with('category:id,name,slug')
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->get($this->cardFields());
    }

    /**
     * @return Collection<int, Course>
     */
    public function listFeaturedCourses(int $limit = 6): Collection
    {
        return Course::query()
            ->published()
            ->featured()
            ->withPurchaseCount()
            ->with('category:id,name,slug')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get($this->cardFields());
    }

    /**
     * @return Collection<int, Course>
     */
    public function listLatestCourses(int $limit = 3): Collection
    {
        return Course::query()
            ->published()
            ->withPurchaseCount()
            ->with('category:id,name,slug')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get($this->cardFields());
    }

    /**
     * @return Collection<int, Course>
     */
    public function listForPricing(): Collection
    {
        return Course::query()
            ->published()
            ->orderBy('price')
            ->get(['id', 'title', 'slug', 'price', 'compare_price', 'excerpt']);
    }

    /**
     * @return list<string>
     */
    private function cardFields(): array
    {
        return [
            'id',
            'category_id',
            'title',
            'slug',
            'excerpt',
            'price',
            'compare_price',
            'thumbnail_path',
            'is_featured',
            'duration_label',
            'lesson_count_label',
            'instructor_name',
            'instructor_title',
            'meta',
        ];
    }

    /**
     * @return list<string>
     */
    private function indexFields(): array
    {
        return [
            'id',
            'category_id',
            'title',
            'slug',
            'excerpt',
            'price',
            'compare_price',
            'thumbnail_path',
            'is_featured',
            'duration_label',
            'lesson_count_label',
            'instructor_name',
        ];
    }
}
