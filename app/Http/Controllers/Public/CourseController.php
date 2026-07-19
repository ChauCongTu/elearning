<?php

namespace App\Http\Controllers\Public;

use App\Contracts\Catalog\CategoryServiceInterface;
use App\Contracts\Catalog\CourseCatalogServiceInterface;
use App\Contracts\Catalog\CourseReviewServiceInterface;
use App\Contracts\Payment\OrderServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function __construct(
        private CourseCatalogServiceInterface $courses,
        private CategoryServiceInterface $categories,
        private CourseReviewServiceInterface $reviews,
        private OrderServiceInterface $orders,
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

    public function show(Request $request, string $slug): Response
    {
        $course = $this->courses->findPublishedBySlug($slug);
        $user = $request->user();

        return Inertia::render('public/courses/show', [
            'course' => $course,
            'reviewSummary' => $this->reviews->summaryForCourse($course),
            'reviews' => $this->reviews->listPublishedForCourse($course),
            'userReview' => $user ? $this->reviews->findUserReview($user, $course) : null,
            'canReview' => $user ? $this->reviews->canUserReview($user, $course) : false,
            'purchaseState' => $user ? $this->orders->purchaseStateForCourse($user, $course) : null,
        ]);
    }
}
