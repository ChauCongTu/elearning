<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminPostServiceInterface;
use App\Contracts\Files\FileServiceInterface;
use App\Enums\FilePrefix;
use App\Models\Post;
use App\Support\SlugGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;

class AdminPostService implements AdminPostServiceInterface
{
    public function __construct(
        private FileServiceInterface $files,
    ) {}

    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Post::query()
            ->with('category:id,name')
            ->orderByDesc('created_at');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['post_category_id'])) {
            $query->where('post_category_id', $filters['post_category_id']);
        }

        return $query->paginate($perPage)->withQueryString()->through(fn (Post $post) => $this->toListArray($post));
    }

    public function findForAdmin(Post $post): array
    {
        return $this->toFormArray($post->load('category:id,name'));
    }

    public function create(array $data): Post
    {
        $slug = $data['slug'] ?? SlugGenerator::unique($data['title'], Post::class);

        return Post::create([
            'post_category_id' => $data['post_category_id'] ?? null,
            'user_id' => $data['user_id'] ?? null,
            'title' => $data['title'],
            'slug' => $slug,
            'excerpt' => $data['excerpt'] ?? null,
            'content' => $data['content'] ?? '',
            'featured_image' => $data['featured_image'] ?? null,
            'author_name' => $data['author_name'] ?? null,
            'is_published' => $data['is_published'] ?? false,
            'is_featured' => $data['is_featured'] ?? false,
            'published_at' => ($data['is_published'] ?? false) ? now() : null,
            'meta' => $data['meta'] ?? null,
        ]);
    }

    public function update(Post $post, array $data): Post
    {
        unset($data['featured_image']);

        if (isset($data['title']) && ! isset($data['slug'])) {
            $data['slug'] = SlugGenerator::unique($data['title'], Post::class, $post->id);
        }

        if (array_key_exists('is_published', $data)) {
            $data['published_at'] = $data['is_published'] ? ($post->published_at ?? now()) : null;
        }

        $post->fill($data);
        $post->save();

        return $post->fresh();
    }

    public function delete(Post $post): void
    {
        if ($post->featured_image) {
            $this->files->delete($post->featured_image);
        }

        $post->delete();
    }

    public function storeFeaturedImage(Post $post, UploadedFile $file): Post
    {
        $path = $this->files->replace($file, FilePrefix::PostFeatured, $post->featured_image);
        $post->update(['featured_image' => $path]);

        return $post->fresh();
    }

    /**
     * @return array<string, mixed>
     */
    private function toListArray(Post $post): array
    {
        return [
            'id' => $post->id,
            'title' => $post->title,
            'slug' => $post->slug,
            'is_published' => $post->is_published,
            'is_featured' => $post->is_featured,
            'published_at' => $post->published_at?->toIso8601String(),
            'category' => $post->category ? [
                'id' => $post->category->id,
                'name' => $post->category->name,
            ] : null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function toFormArray(Post $post): array
    {
        return [
            'id' => $post->id,
            'post_category_id' => $post->post_category_id,
            'title' => $post->title,
            'slug' => $post->slug,
            'excerpt' => $post->excerpt,
            'content' => $post->content,
            'featured_image' => $post->featured_image,
            'featured_image_url' => $post->featured_image_url,
            'author_name' => $post->author_name,
            'is_published' => $post->is_published,
            'is_featured' => $post->is_featured,
            'published_at' => $post->published_at?->toIso8601String(),
        ];
    }
}
