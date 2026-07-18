<?php

namespace App\Services\Learning;

use App\Contracts\Learning\EnrollmentProgressServiceInterface;
use App\Contracts\Learning\LearningServiceInterface;
use App\Contracts\Video\VideoStreamServiceInterface;
use App\Enums\EnrollmentStatus;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;

class LearningService implements LearningServiceInterface
{
    public function __construct(
        private VideoStreamServiceInterface $videoStream,
    ) {}

    public function findPublishedCourseOrFail(string $slug): Course
    {
        return Course::query()
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();
    }

    public function findActiveEnrollment(?User $user, Course $course): ?Enrollment
    {
        if ($user === null) {
            return null;
        }

        return Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('status', EnrollmentStatus::Active)
            ->first();
    }

    public function canAccessLesson(
        ?User $user,
        Lesson $lesson,
        Course $course,
        ?array $progressByLesson = null,
    ): bool {
        $this->ensureLessonBelongsToCourse($lesson, $course);

        if (! $lesson->is_published) {
            return $user?->isAdmin() ?? false;
        }

        if ($user?->isAdmin()) {
            return true;
        }

        $hasBaseAccess = $lesson->is_free_preview
            || ($user !== null && $this->findActiveEnrollment($user, $course) !== null);

        if (! $hasBaseAccess) {
            return false;
        }

        return $this->isSequentiallyUnlocked($lesson, $course, $user, $progressByLesson);
    }

    public function ensureLessonBelongsToCourse(Lesson $lesson, Course $course): void
    {
        $lesson->loadMissing('chapter');

        if ($lesson->chapter?->course_id !== $course->id) {
            abort(404);
        }
    }

    public function resolveResumeLesson(Course $course, ?User $user): ?Lesson
    {
        $lessons = $this->orderedPublishedLessons($course);

        if ($lessons->isEmpty()) {
            return null;
        }

        $enrollment = $this->findActiveEnrollment($user, $course);

        if ($enrollment !== null) {
            $progressByLesson = $this->progressMap($enrollment);

            $inProgress = LessonProgress::query()
                ->where('enrollment_id', $enrollment->id)
                ->where('completed', false)
                ->whereNotNull('last_watched_at')
                ->orderByDesc('last_watched_at')
                ->first();

            if ($inProgress !== null) {
                $lesson = $lessons->firstWhere('id', $inProgress->lesson_id);

                if ($lesson !== null && $this->canAccessLesson($user, $lesson, $course, $progressByLesson)) {
                    return $lesson;
                }
            }

            foreach ($lessons as $lesson) {
                if (! $this->canAccessLesson($user, $lesson, $course, $progressByLesson)) {
                    continue;
                }

                $completed = ($progressByLesson[$lesson->id]['completed'] ?? false) === true;

                if (! $completed) {
                    return $lesson;
                }
            }
        }

        foreach ($lessons as $lesson) {
            if ($this->canAccessLesson($user, $lesson, $course)) {
                return $lesson;
            }
        }

        return null;
    }

    public function buildPlayerPayload(Course $course, Lesson $lesson, ?User $user): array
    {
        $enrollment = $this->findActiveEnrollment($user, $course);
        $lessons = $this->orderedPublishedLessons($course);
        $progressByLesson = $this->progressMap($enrollment);
        $signedUrl = $this->videoStream->signedUrl($lesson);
        $currentProgress = $progressByLesson[$lesson->id] ?? null;
        $currentIndex = $lessons->search(fn (Lesson $item) => $item->id === $lesson->id);

        $chapters = $course->publishedChapters()
            ->with(['publishedLessons'])
            ->get()
            ->map(fn ($chapter) => [
                'id' => $chapter->id,
                'title' => $chapter->title,
                'lessons' => $chapter->publishedLessons->map(function (Lesson $chapterLesson) use (
                    $lesson,
                    $course,
                    $user,
                    $progressByLesson,
                ) {
                    $record = $progressByLesson[$chapterLesson->id] ?? null;
                    $accessible = $this->canAccessLesson($user, $chapterLesson, $course, $progressByLesson);

                    return [
                        'id' => $chapterLesson->id,
                        'title' => $chapterLesson->title,
                        'duration_seconds' => $chapterLesson->duration_seconds,
                        'is_free_preview' => $chapterLesson->is_free_preview,
                        'is_current' => $chapterLesson->id === $lesson->id,
                        'is_locked' => ! $accessible,
                        'completed' => (bool) ($record['completed'] ?? false),
                        'watched_seconds' => (int) ($record['watched_seconds'] ?? 0),
                    ];
                })->values()->all(),
            ])
            ->values()
            ->all();

        return [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'progress_percent' => $enrollment !== null
                    ? (string) $enrollment->fresh()->progress_percent
                    : '0.00',
            ],
            'currentLesson' => [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'duration_seconds' => $lesson->duration_seconds,
                'watched_seconds' => (int) ($currentProgress['watched_seconds'] ?? 0),
                'completed' => (bool) ($currentProgress['completed'] ?? false),
                'is_free_preview' => $lesson->is_free_preview,
            ],
            'videoUrl' => $signedUrl,
            'videoUrlExpiresAt' => $signedUrl !== null
                ? Carbon::now()->addMinutes((int) config('video.signed_url_ttl_minutes', 120))->toIso8601String()
                : null,
            'chapters' => $chapters,
            'navigation' => [
                'prev' => $this->navigationLesson($lessons, $currentIndex, -1, $user, $course, $progressByLesson),
                'next' => $this->navigationLesson($lessons, $currentIndex, 1, $user, $course, $progressByLesson),
            ],
            'canTrackProgress' => $enrollment !== null,
            'unlock_ratio' => (float) config('video.unlock_ratio', 0.8),
        ];
    }

    /**
     * @return Collection<int, Lesson>
     */
    private function orderedPublishedLessons(Course $course): Collection
    {
        return Lesson::query()
            ->where('is_published', true)
            ->whereHas('chapter', fn ($query) => $query
                ->where('course_id', $course->id)
                ->where('is_published', true))
            ->with('chapter')
            ->get()
            ->sortBy([
                fn (Lesson $lesson) => $lesson->chapter->sort_order,
                fn (Lesson $lesson) => $lesson->sort_order,
            ])
            ->values();
    }

    /**
     * @return array<string, array{watched_seconds: int, completed: bool}>
     */
    private function progressMap(?Enrollment $enrollment): array
    {
        if ($enrollment === null) {
            return [];
        }

        return LessonProgress::query()
            ->where('enrollment_id', $enrollment->id)
            ->get()
            ->mapWithKeys(fn (LessonProgress $record) => [
                $record->lesson_id => [
                    'watched_seconds' => $record->watched_seconds,
                    'completed' => $record->completed,
                ],
            ])
            ->all();
    }

    /**
     * @param  Collection<int, Lesson>  $lessons
     * @return array{id: string, title: string}|null
     */
    private function navigationLesson(
        Collection $lessons,
        int|false $currentIndex,
        int $step,
        ?User $user,
        Course $course,
        array $progressByLesson = [],
    ): ?array {
        if ($currentIndex === false) {
            return null;
        }

        for ($index = $currentIndex + $step; $step > 0 ? $index < $lessons->count() : $index >= 0; $index += $step) {
            $candidate = $lessons->get($index);

            if ($candidate !== null && $this->canAccessLesson($user, $candidate, $course, $progressByLesson)) {
                return [
                    'id' => $candidate->id,
                    'title' => $candidate->title,
                ];
            }
        }

        return null;
    }

    private function isSequentiallyUnlocked(
        Lesson $lesson,
        Course $course,
        ?User $user,
        ?array $progressByLesson = null,
    ): bool {
        $lessons = $this->orderedPublishedLessons($course);
        $index = $lessons->search(fn (Lesson $item) => $item->id === $lesson->id);

        if ($index === false || $index === 0) {
            return true;
        }

        $previousLesson = $lessons->get($index - 1);

        if ($previousLesson === null) {
            return true;
        }

        $enrollment = $this->findActiveEnrollment($user, $course);

        if ($enrollment === null) {
            return false;
        }

        $progressByLesson ??= $this->progressMap($enrollment);
        $watchedSeconds = (int) ($progressByLesson[$previousLesson->id]['watched_seconds'] ?? 0);

        return $this->meetsUnlockThreshold($previousLesson, $watchedSeconds);
    }

    private function meetsUnlockThreshold(Lesson $lesson, int $watchedSeconds): bool
    {
        $duration = $lesson->duration_seconds;

        if ($duration <= 0) {
            return $watchedSeconds > 0;
        }

        $threshold = (int) floor($duration * (float) config('video.unlock_ratio', 0.8));

        return $watchedSeconds >= max(1, $threshold);
    }
}
