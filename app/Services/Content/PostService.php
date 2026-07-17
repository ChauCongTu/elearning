<?php

namespace App\Services\Content;

use App\Contracts\Content\PostServiceInterface;
use App\Models\Post;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class PostService implements PostServiceInterface
{
    /**
     * @return list<string>
     */
    private function cardFields(): array
    {
        return [
            'id',
            'post_category_id',
            'title',
            'slug',
            'excerpt',
            'featured_image',
            'author_name',
            'is_featured',
            'published_at',
        ];
    }

    public function paginatePublished(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        $search = trim($filters['q'] ?? '');
        $categorySlug = trim($filters['category'] ?? '');

        $query = Post::query()
            ->published()
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

        return $query
            ->orderByDesc('published_at')
            ->paginate($perPage, $this->cardFields())
            ->withQueryString();
    }

    public function findPublishedBySlug(string $slug): Post
    {
        return Post::query()
            ->where('slug', $slug)
            ->published()
            ->with('category:id,name,slug')
            ->firstOrFail();
    }

    public function listRelated(Post $post, int $limit = 6): Collection
    {
        return Post::query()
            ->published()
            ->where('id', '!=', $post->id)
            ->when(
                $post->post_category_id,
                fn ($query) => $query->where('post_category_id', $post->post_category_id),
            )
            ->with('category:id,name,slug')
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get($this->cardFields());
    }

    public function listHomeSections(): array
    {
        $sections = config('site.content.article_sections', []);

        return collect($sections)->map(function (array $section) {
            $categorySlug = $section['category_slug'] ?? null;
            $limit = $section['limit'] ?? 2;

            $articles = $categorySlug
                ? $this->listByCategorySlug($categorySlug, $limit)
                : collect();

            return [
                'key' => $section['key'],
                'title' => $section['title'],
                'view_all_url' => $categorySlug
                    ? route('posts.category', $categorySlug)
                    : route('posts.index'),
                'articles' => $articles->map(fn (Post $post) => [
                    'title' => $post->title,
                    'excerpt' => $post->excerpt ?? '',
                    'url' => route('posts.show', $post->slug),
                    'slug' => $post->slug,
                    'featured_image' => $post->featured_image,
                    'published_at' => $post->published_at?->toIso8601String(),
                ])->all(),
            ];
        })->all();
    }

    /**
     * @return Collection<int, Post>
     */
    private function listByCategorySlug(string $categorySlug, int $limit): Collection
    {
        return Post::query()
            ->published()
            ->whereHas('category', fn ($category) => $category->where('slug', $categorySlug))
            ->orderByDesc('published_at')
            ->limit($limit)
            ->get($this->cardFields());
    }
}
