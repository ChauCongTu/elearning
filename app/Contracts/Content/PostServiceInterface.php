<?php

namespace App\Contracts\Content;

use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface PostServiceInterface
{
    /**
     * @param  array{q?: string, category?: string, page?: int}  $filters
     */
    public function paginatePublished(array $filters, int $perPage = 12): LengthAwarePaginator;

    public function findPublishedBySlug(string $slug): Post;

    /**
     * @return Collection<int, Post>
     */
    public function listRelated(Post $post, int $limit = 6): Collection;

    /**
     * @return list<array{key: string, title: string, view_all_url: string, articles: list<array{title: string, excerpt: string, url: string, slug: string, published_at: string|null}>}>
     */
    public function listHomeSections(): array;
}
