<?php

namespace App\Policies;

use App\Contracts\Learning\LearningServiceInterface;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;

class LessonPolicy
{
    public function __construct(
        private LearningServiceInterface $learning,
    ) {}

    public function view(?User $user, Lesson $lesson, Course $course): bool
    {
        return $this->learning->canAccessLesson($user, $lesson, $course);
    }
}
