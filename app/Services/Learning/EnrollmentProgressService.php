<?php

namespace App\Services\Learning;

use App\Contracts\Learning\EnrollmentProgressServiceInterface;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;

class EnrollmentProgressService implements EnrollmentProgressServiceInterface
{
    public function updateProgress(Enrollment $enrollment, Lesson $lesson, int $watchedSeconds): LessonProgress
    {
        $watchedSeconds = max(0, $watchedSeconds);

        $record = LessonProgress::query()->firstOrNew([
            'enrollment_id' => $enrollment->id,
            'lesson_id' => $lesson->id,
        ]);

        $previous = (int) ($record->watched_seconds ?? 0);
        $maxAdvance = (int) config('video.max_progress_advance_seconds', 35);
        $capped = min($watchedSeconds, $previous + $maxAdvance);

        $record->watched_seconds = max($previous, $capped);
        $record->completed = $this->shouldMarkCompleted($lesson, $record->watched_seconds);
        $record->last_watched_at = now();
        $record->save();

        $this->recalculate($enrollment);

        return $record->fresh();
    }

    public function recalculate(Enrollment $enrollment): void
    {
        $courseId = $enrollment->course_id;

        $totalLessons = Lesson::query()
            ->where('is_published', true)
            ->whereHas('chapter', fn ($query) => $query
                ->where('course_id', $courseId)
                ->where('is_published', true))
            ->count();

        if ($totalLessons === 0) {
            $enrollment->update([
                'progress_percent' => 0,
                'completed_at' => null,
            ]);

            return;
        }

        $completedLessons = LessonProgress::query()
            ->where('enrollment_id', $enrollment->id)
            ->where('completed', true)
            ->whereHas('lesson', fn ($query) => $query
                ->where('is_published', true)
                ->whereHas('chapter', fn ($chapterQuery) => $chapterQuery
                    ->where('course_id', $courseId)
                    ->where('is_published', true)))
            ->count();

        $percent = round(($completedLessons / $totalLessons) * 100, 2);

        $enrollment->update([
            'progress_percent' => min(100, $percent),
            'completed_at' => $percent >= 100 ? ($enrollment->completed_at ?? now()) : null,
        ]);
    }

    private function shouldMarkCompleted(Lesson $lesson, int $watchedSeconds): bool
    {
        $duration = $lesson->duration_seconds;

        if ($duration <= 0) {
            return $watchedSeconds > 0;
        }

        $threshold = (int) floor($duration * (float) config('video.completion_ratio', 0.9));

        return $watchedSeconds >= max(1, $threshold);
    }
}
