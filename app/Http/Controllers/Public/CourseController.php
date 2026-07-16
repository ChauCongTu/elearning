<?php

namespace App\Http\Controllers\Public;

use App\Contracts\Catalog\CategoryServiceInterface;
use App\Contracts\Catalog\CourseCatalogServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function __construct(
        private CourseCatalogServiceInterface $courses,
        private CategoryServiceInterface $categories,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('q')->trim()->toString();
        $categorySlug = $request->string('category')->trim()->toString();
        $sort = $request->string('sort')->toString() ?: 'latest';

        return Inertia::render('public/courses/index', [
            'courses' => $this->courses->listForCatalog([
                'q' => $search,
                'category' => $categorySlug,
                'sort' => $sort,
            ]),
            'categories' => $this->categories->listActive(),
            'filters' => [
                'q' => $search,
                'category' => $categorySlug,
                'sort' => $sort,
            ],
        ]);
    }

    public function show(string $slug): Response
    {
        return Inertia::render('public/courses/show', [
            'course' => $this->courses->findPublishedBySlug($slug),
        ]);
    }
}
