<?php

namespace App\Http\Controllers\Public;

use App\Contracts\Content\PostCategoryServiceInterface;
use App\Contracts\Content\PostServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(
        private PostServiceInterface $posts,
        private PostCategoryServiceInterface $categories,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('q')->trim()->toString();
        $categorySlug = $request->string('category')->trim()->toString();

        return Inertia::render('public/posts/index', [
            'posts' => $this->posts->paginatePublished([
                'q' => $search,
                'category' => $categorySlug,
            ]),
            'categories' => $this->categories->listActive(),
            'filters' => [
                'q' => $search,
                'category' => $categorySlug,
            ],
            'activeCategory' => null,
        ]);
    }

    public function category(string $category): Response
    {
        $activeCategory = $this->categories->listActive()->firstWhere('slug', $category);

        abort_unless($activeCategory, 404);

        return Inertia::render('public/posts/index', [
            'posts' => $this->posts->paginatePublished(['category' => $category]),
            'categories' => $this->categories->listActive(),
            'filters' => [
                'q' => '',
                'category' => $category,
            ],
            'activeCategory' => $activeCategory,
        ]);
    }

    public function show(string $slug): Response
    {
        $post = $this->posts->findPublishedBySlug($slug);

        return Inertia::render('public/posts/show', [
            'post' => $post,
            'relatedPosts' => $this->posts->listRelated($post),
        ]);
    }
}
