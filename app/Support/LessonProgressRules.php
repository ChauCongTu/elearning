<?php

namespace App\Support;

use App\Models\Lesson;

class LessonProgressRules
{
    public static function unlockThresholdSeconds(Lesson $lesson): ?int
    {
        $duration = (int) $lesson->duration_seconds;

        if ($duration <= 0) {
            return null;
        }

        return max(1, (int) floor($duration * (float) config('video.unlock_ratio', 0.8)));
    }

    public static function meetsUnlockThreshold(Lesson $lesson, int $watchedSeconds): bool
    {
        $threshold = self::unlockThresholdSeconds($lesson);

        if ($threshold === null) {
            return false;
        }

        return $watchedSeconds >= $threshold;
    }

    /**
     * @param  array{watched_seconds?: int, completed?: bool}|null  $progress
     */
    public static function priorLessonUnlocksNext(Lesson $lesson, ?array $progress): bool
    {
        return self::meetsUnlockThreshold($lesson, (int) ($progress['watched_seconds'] ?? 0));
    }

    public static function completionThresholdSeconds(Lesson $lesson): ?int
    {
        $duration = (int) $lesson->duration_seconds;

        if ($duration <= 0) {
            return null;
        }

        return max(1, (int) floor($duration * (float) config('video.completion_ratio', 0.9)));
    }

    public static function shouldMarkCompleted(Lesson $lesson, int $watchedSeconds): bool
    {
        $threshold = self::completionThresholdSeconds($lesson);

        if ($threshold === null) {
            return false;
        }

        return $watchedSeconds >= $threshold;
    }
}
