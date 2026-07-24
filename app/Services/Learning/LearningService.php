<?php

namespace App\Services\Learning;

use App\Contracts\Learning\EnrollmentProgressServiceInterface;
use App\Contracts\Learning\LearningServiceInterface;
use App\Enums\EnrollmentStatus;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\User;
use App\Support\LessonProgressRules;
use Illuminate\Database\Eloquent\Collection;

class LearningService implements LearningServiceInterface
{
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
        $progressByLesson = $this->progressMap($enrollment);

        if ($enrollment !== null) {
            foreach ($lessons as $lesson) {
                if (! $this->canAccessLesson($user, $lesson, $course, $progressByLesson)) {
                    break;
                }

                if (($progressByLesson[$lesson->id]['completed'] ?? false) !== true) {
                    return $lesson;
                }
            }

            foreach ($lessons->reverse()->values() as $lesson) {
                if ($this->canAccessLesson($user, $lesson, $course, $progressByLesson)) {
                    return $lesson;
                }
            }

            return null;
        }

        foreach ($lessons as $lesson) {
            if ($this->canAccessLesson($user, $lesson, $course, $progressByLesson)) {
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
        $currentProgress = $progressByLesson[$lesson->id] ?? null;
        $currentIndex = $lessons->search(fn (Lesson $item) => $item->id === $lesson->id);
        $lessonsByChapter = $lessons->groupBy('chapter_id');

        $chapters = $course->publishedChapters()
            ->orderBy('sort_order')
            ->get()
            ->map(function ($chapter) use (
                $lesson,
                $course,
                $user,
                $progressByLesson,
                $lessonsByChapter,
            ) {
                $chapterLessons = $lessonsByChapter->get($chapter->id, collect());

                return [
                    'id' => $chapter->id,
                    'title' => $chapter->title,
                    'lessons' => $chapterLessons->map(function (Lesson $chapterLesson) use (
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
                ];
            })
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
            'videoStreamUrl' => filled($lesson->video_s3_key)
                ? route('learn.lessons.stream', ['lesson' => $lesson])
                : null,
            'chapters' => $chapters,
            'navigation' => [
                'prev' => $this->navigationLesson($lessons, $currentIndex, -1, $user, $course, $progressByLesson),
                'next' => $this->navigationLesson($lessons, $currentIndex, 1, $user, $course, $progressByLesson),
            ],
            'canTrackProgress' => $enrollment !== null,
            'unlock_ratio' => (float) config('video.unlock_ratio', 0.8),
            'watermark' => $this->watermarkPayload($user),
            'capture_guard' => $this->captureGuardPayload(),
        ];
    }

    /**
     * @return array{
     *     enabled: bool,
     *     pause_on_hidden: bool,
     *     block_capture_shortcuts: bool
     * }
     */
    private function captureGuardPayload(): array
    {
        $config = config('video.capture_guard', []);

        return [
            'enabled' => (bool) ($config['enabled'] ?? true),
            'pause_on_hidden' => (bool) ($config['pause_on_hidden'] ?? true),
            'block_capture_shortcuts' => (bool) ($config['block_capture_shortcuts'] ?? true),
        ];
    }

    /**
     * @return array{
     *     enabled: bool,
     *     label: string|null,
     *     min_interval_seconds: int,
     *     max_interval_seconds: int,
     *     min_visible_seconds: int,
     *     max_visible_seconds: int,
     *     initial_delay_min_seconds: int,
     *     initial_delay_max_seconds: int
     * }
     */
    private function watermarkPayload(?User $user): array
    {
        $config = config('video.watermark', []);
        $label = null;

        if ($user !== null && filled($user->email)) {
            $name = trim((string) $user->name);
            $label = ($name !== '' ? $name : 'Học viên').' - '.$user->email;
        }

        return [
            'enabled' => ($config['enabled'] ?? true) && $label !== null,
            'label' => $label,
            'min_interval_seconds' => (int) ($config['min_interval_seconds'] ?? 90),
            'max_interval_seconds' => (int) ($config['max_interval_seconds'] ?? 210),
            'min_visible_seconds' => (int) ($config['min_visible_seconds'] ?? 5),
            'max_visible_seconds' => (int) ($config['max_visible_seconds'] ?? 10),
            'initial_delay_min_seconds' => (int) ($config['initial_delay_min_seconds'] ?? 30),
            'initial_delay_max_seconds' => (int) ($config['initial_delay_max_seconds'] ?? 75),
        ];
    }

    /**
     * @return Collection<int, Lesson>
     */
    private function orderedPublishedLessons(Course $course): Collection
    {
        return Lesson::query()
            ->select('lessons.*')
            ->join('chapters', 'chapters.id', '=', 'lessons.chapter_id')
            ->where('lessons.is_published', true)
            ->where('chapters.course_id', $course->id)
            ->where('chapters.is_published', true)
            ->orderBy('chapters.sort_order')
            ->orderBy('lessons.sort_order')
            ->orderBy('lessons.created_at')
            ->with('chapter')
            ->get();
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

        $targetIndex = $currentIndex + $step;
        $candidate = $lessons->get($targetIndex);

        if ($candidate === null) {
            return null;
        }

        if (! $this->canAccessLesson($user, $candidate, $course, $progressByLesson)) {
            return null;
        }

        return [
            'id' => $candidate->id,
            'title' => $candidate->title,
        ];
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

        $enrollment = $this->findActiveEnrollment($user, $course);

        if ($enrollment === null) {
            return false;
        }

        $progressByLesson ??= $this->progressMap($enrollment);

        for ($i = 0; $i < $index; $i++) {
            $priorLesson = $lessons->get($i);

            if ($priorLesson === null) {
                continue;
            }

            if (! $this->lessonMeetsUnlockRequirement($priorLesson, $progressByLesson[$priorLesson->id] ?? null)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param  array{watched_seconds?: int, completed?: bool}|null  $progress
     */
    private function lessonMeetsUnlockRequirement(Lesson $lesson, ?array $progress): bool
    {
        return LessonProgressRules::priorLessonUnlocksNext($lesson, $progress);
    }
}
