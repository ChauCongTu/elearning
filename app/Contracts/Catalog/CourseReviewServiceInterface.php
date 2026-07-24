<?php

namespace App\Contracts\Catalog;

use App\Models\Course;
use App\Models\CourseReview;
use App\Models\User;
use Illuminate\Support\Collection;

interface CourseReviewServiceInterface
{
    /**
     * @return array{average: float|null, count: int}
     */
    public function summaryForCourse(Course $course): array;

    /**
     * @return Collection<int, CourseReview>
     */
    public function listPublishedForCourse(Course $course, int $limit = 20): Collection;

    public function findUserReview(User $user, Course $course): ?CourseReview;

    public function canUserReview(User $user, Course $course): bool;

    /**
     * @param  array{rating: int, body?: string|null}  $data
     */
    public function upsertForUser(User $user, Course $course, array $data): CourseReview;

    /**
     * @return Collection<int, CourseReview>
     */
    public function listForAdmin(int $limit = 50): Collection;

    public function setPublished(CourseReview $review, bool $published): CourseReview;

    /**
     * @param  array{course_id: string, reviewer_name: string, rating: int, body?: string|null, is_published?: bool}  $data
     */
    public function createAdminReview(array $data, User $admin): CourseReview;

    public function deleteReview(CourseReview $review): void;
}
