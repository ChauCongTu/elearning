<?php

namespace App\Contracts\Learning;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;

interface LearningServiceInterface
{
    public function findPublishedCourseOrFail(string $slug): Course;

    public function findActiveEnrollment(?User $user, Course $course): ?Enrollment;

    public function canAccessLesson(
        ?User $user,
        Lesson $lesson,
        Course $course,
        ?array $progressByLesson = null,
    ): bool;

    public function ensureLessonBelongsToCourse(Lesson $lesson, Course $course): void;

    public function resolveResumeLesson(Course $course, ?User $user): ?Lesson;

    /**
     * @return array<string, mixed>
     */
    public function buildPlayerPayload(Course $course, Lesson $lesson, ?User $user): array;
}
