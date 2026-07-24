<?php

namespace App\Services\Catalog;

use App\Contracts\Catalog\CourseReviewServiceInterface;
use App\Enums\EnrollmentStatus;
use App\Models\Course;
use App\Models\CourseReview;
use App\Models\User;
use Illuminate\Support\Collection;

class CourseReviewService implements CourseReviewServiceInterface
{
    /**
     * @return array{average: float|null, count: int}
     */
    public function summaryForCourse(Course $course): array
    {
        $stats = CourseReview::query()
            ->where('course_id', $course->id)
            ->where('is_published', true)
            ->selectRaw('AVG(rating) as average, COUNT(*) as count')
            ->first();

        $count = (int) ($stats->count ?? 0);

        return [
            'average' => $count > 0 ? round((float) $stats->average, 1) : null,
            'count' => $count,
        ];
    }

    /**
     * @return Collection<int, CourseReview>
     */
    public function listPublishedForCourse(Course $course, int $limit = 20): Collection
    {
        return CourseReview::query()
            ->where('course_id', $course->id)
            ->where('is_published', true)
            ->with('user:id,name')
            ->latest()
            ->limit($limit)
            ->get(['id', 'user_id', 'reviewer_name', 'course_id', 'rating', 'body', 'is_admin_created', 'created_at']);
    }

    public function findUserReview(User $user, Course $course): ?CourseReview
    {
        return CourseReview::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first(['id', 'user_id', 'course_id', 'rating', 'body', 'is_published', 'created_at']);
    }

    public function canUserReview(User $user, Course $course): bool
    {
        return $course->enrollments()
            ->where('user_id', $user->id)
            ->where('status', EnrollmentStatus::Active)
            ->exists();
    }

    /**
     * @param  array{rating: int, body?: string|null}  $data
     */
    public function upsertForUser(User $user, Course $course, array $data): CourseReview
    {
        return CourseReview::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'course_id' => $course->id,
            ],
            [
                'rating' => $data['rating'],
                'body' => $data['body'] ?? null,
                'is_published' => true,
            ],
        );
    }

    /**
     * @return Collection<int, CourseReview>
     */
    public function listForAdmin(int $limit = 50): Collection
    {
        return CourseReview::query()
            ->with(['user:id,name,email', 'course:id,title,slug'])
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function setPublished(CourseReview $review, bool $published): CourseReview
    {
        $review->update(['is_published' => $published]);

        return $review->fresh(['user:id,name,email', 'course:id,title,slug']);
    }

    public function createAdminReview(array $data, User $admin): CourseReview
    {
        return CourseReview::query()->create([
            'course_id' => $data['course_id'],
            'user_id' => null,
            'reviewer_name' => trim($data['reviewer_name']),
            'rating' => $data['rating'],
            'body' => $data['body'] ?? null,
            'is_published' => $data['is_published'] ?? true,
            'is_admin_created' => true,
        ]);
    }

    public function deleteReview(CourseReview $review): void
    {
        $review->delete();
    }
}
