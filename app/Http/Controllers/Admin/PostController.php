<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Admin\AdminPostCategoryServiceInterface;
use App\Contracts\Admin\AdminPostServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Services\Admin\AdminPostService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(
        private AdminPostServiceInterface $posts,
        private AdminPostCategoryServiceInterface $categories,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('admin/posts/index', [
            'posts' => $this->posts->paginateForAdmin($request->only(['search', 'post_category_id'])),
            'filters' => $request->only(['search', 'post_category_id']),
            'categories' => $this->categories->listForAdmin(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/posts/form', [
            'post' => null,
            'categories' => $this->categories->listForAdmin(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedPost($request);
        $service = app(AdminPostService::class);

        $post = $service->create([
            ...$data,
            'user_id' => $request->user()->id,
            'author_name' => $request->user()->name,
        ]);

        if ($request->hasFile('featured_image')) {
            $service->storeFeaturedImage($post, $request->file('featured_image'));
        }

        return redirect()
            ->route('admin.posts.edit', $post)
            ->with('success', 'Đã tạo bài viết.');
    }

    public function edit(Post $post): Response
    {
        return Inertia::render('admin/posts/form', [
            'post' => $this->posts->findForAdmin($post),
            'categories' => $this->categories->listForAdmin(),
        ]);
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        $data = $this->validatedPost($request);
        unset($data['featured_image']);
        $service = app(AdminPostService::class);

        $service->update($post, $data);

        if ($request->hasFile('featured_image')) {
            $service->storeFeaturedImage($post, $request->file('featured_image'));
        }

        return back()->with('success', 'Đã cập nhật bài viết.');
    }

    public function toggle(Request $request, Post $post): RedirectResponse
    {
        $data = $request->validate([
            'is_published' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ]);

        $payload = [];
        if (array_key_exists('is_published', $data)) {
            $payload['is_published'] = $request->boolean('is_published');
            $payload['published_at'] = $request->boolean('is_published') ? ($post->published_at ?? now()) : null;
        }
        if (array_key_exists('is_featured', $data)) {
            $payload['is_featured'] = $request->boolean('is_featured');
        }

        app(AdminPostService::class)->update($post, $payload);

        return back();
    }

    public function destroy(Post $post): RedirectResponse
    {
        $this->posts->delete($post);

        return redirect()
            ->route('admin.posts.index')
            ->with('success', 'Đã xóa bài viết.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedPost(Request $request): array
    {
        return $request->validate([
            'post_category_id' => ['nullable', 'uuid', 'exists:post_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'content' => ['nullable', 'string'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
            'is_featured' => ['nullable', 'boolean'],
            'featured_image' => ['nullable', 'image', 'max:5120'],
        ], [
            'title.required' => 'Vui lòng nhập tiêu đề bài viết.',
        ]);
    }
}
