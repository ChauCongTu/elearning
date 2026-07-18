<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Catalog\CourseReviewServiceInterface;
use App\Http\Controllers\Controller;
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
        ]);
    }

    public function update(Request $request, CourseReview $review): RedirectResponse
    {
        $validated = $request->validate([
            'is_published' => ['required', 'boolean'],
        ]);

        $this->reviews->setPublished($review, $validated['is_published']);

        return back();
    }
}
