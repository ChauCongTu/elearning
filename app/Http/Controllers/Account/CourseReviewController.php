<?php

namespace App\Http\Controllers\Account;

use App\Contracts\Catalog\CourseCatalogServiceInterface;
use App\Contracts\Catalog\CourseReviewServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseReviewRequest;
use Illuminate\Http\RedirectResponse;

class CourseReviewController extends Controller
{
    public function __construct(
        private CourseCatalogServiceInterface $courses,
        private CourseReviewServiceInterface $reviews,
    ) {}

    public function store(StoreCourseReviewRequest $request, string $slug): RedirectResponse
    {
        $course = $this->courses->findPublishedBySlug($slug);
        $user = $request->user();

        abort_unless($this->reviews->canUserReview($user, $course), 403, 'Bạn cần đăng ký khóa học để đánh giá.');

        $this->reviews->upsertForUser($user, $course, $request->validated());

        return back()->with('review_success', true);
    }
}
