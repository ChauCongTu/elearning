<?php

namespace App\Services\Learning;

use App\Contracts\Learning\EnrollmentProgressServiceInterface;
use App\Contracts\Mail\TransactionalMailServiceInterface;
use App\Contracts\Student\CertificateServiceInterface;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Support\LessonProgressRules;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class EnrollmentProgressService implements EnrollmentProgressServiceInterface
{
    public function __construct(
        private TransactionalMailServiceInterface $transactionalMail,
        private CertificateServiceInterface $certificates,
    ) {}

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
        $record->completed = LessonProgressRules::shouldMarkCompleted($lesson, $record->watched_seconds);
        $record->last_watched_at = now();
        $record->save();

        $this->recalculate($enrollment);

        return $record->fresh();
    }

    public function markLessonComplete(Enrollment $enrollment, Lesson $lesson): LessonProgress
    {
        $record = LessonProgress::query()->firstOrNew([
            'enrollment_id' => $enrollment->id,
            'lesson_id' => $lesson->id,
        ]);

        $watchedSeconds = (int) ($record->watched_seconds ?? 0);

        if (! LessonProgressRules::meetsUnlockThreshold($lesson, $watchedSeconds)) {
            throw ValidationException::withMessages([
                'lesson' => 'Cần xem ít nhất 80% bài học trước khi đánh dấu hoàn thành.',
            ]);
        }

        $duration = max(0, (int) $lesson->duration_seconds);
        $completionThreshold = LessonProgressRules::completionThresholdSeconds($lesson);
        $targetWatch = $completionThreshold ?? $watchedSeconds;

        $record->watched_seconds = max($watchedSeconds, $targetWatch);
        $record->completed = true;
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

        $wasCompleted = $enrollment->isCompleted();

        $enrollment->update([
            'progress_percent' => min(100, $percent),
            'completed_at' => $percent >= 100 ? ($enrollment->completed_at ?? now()) : null,
        ]);

        if (! $wasCompleted && $enrollment->fresh()->isCompleted()) {
            $completedEnrollment = $enrollment->fresh(['user', 'course']);
            $this->transactionalMail->sendCourseCompleted($completedEnrollment);

            try {
                $this->certificates->issue($completedEnrollment);
            } catch (\Throwable $exception) {
                Log::error('Certificate issue failed after course completion', [
                    'enrollment_id' => $enrollment->id,
                    'message' => $exception->getMessage(),
                ]);
            }
        }
    }
}
