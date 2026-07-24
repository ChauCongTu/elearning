<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Catalog\CourseReviewServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseReview;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseReviewController extends Controller
{
    public function __construct(
        private CourseReviewServiceInterface $reviews,
    ) {}

    public function index(): Response
    {
        return Inertia::render('admin/reviews/index', [
            'reviews' => $this->reviews->listForAdmin(),
            'courses' => Course::query()->orderBy('title')->get(['id', 'title']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'uuid', 'exists:courses,id'],
            'reviewer_name' => ['required', 'string', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'body' => ['nullable', 'string', 'max:5000'],
            'is_published' => ['nullable', 'boolean'],
        ], [
            'reviewer_name.required' => 'Vui lòng nhập tên hiển thị.',
        ]);

        $this->reviews->createAdminReview([
            ...$validated,
            'is_published' => $request->boolean('is_published', true),
        ], $request->user());

        return back()->with('success', 'Đã thêm đánh giá marketing.');
    }

    public function update(Request $request, CourseReview $review): RedirectResponse
    {
        $validated = $request->validate([
            'is_published' => ['required', 'boolean'],
        ]);

        $this->reviews->setPublished($review, $validated['is_published']);

        return back();
    }

    public function destroy(CourseReview $review): RedirectResponse
    {
        $this->reviews->deleteReview($review);

        return back()->with('success', 'Đã xóa đánh giá.');
    }
}
