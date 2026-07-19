<?php

namespace App\Contracts\Learning;

use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;

interface EnrollmentProgressServiceInterface
{
    public function updateProgress(Enrollment $enrollment, Lesson $lesson, int $watchedSeconds): LessonProgress;

    public function markLessonComplete(Enrollment $enrollment, Lesson $lesson): LessonProgress;

    public function recalculate(Enrollment $enrollment): void;
}
