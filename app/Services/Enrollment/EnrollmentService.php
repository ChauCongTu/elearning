<?php

namespace App\Services\Enrollment;

use App\Contracts\Enrollment\EnrollmentServiceInterface;
use App\Enums\EnrollmentStatus;
use App\Models\Enrollment;
use App\Models\User;

class EnrollmentService implements EnrollmentServiceInterface
{
    public function listActiveForUser(User $user): array
    {
        return Enrollment::query()
            ->where('user_id', $user->id)
            ->where('status', EnrollmentStatus::Active)
            ->with(['course' => fn ($query) => $query->select([
                'id',
                'title',
                'slug',
                'excerpt',
                'thumbnail_path',
                'duration_label',
                'lesson_count_label',
            ])])
            ->orderByDesc('enrolled_at')
            ->get()
            ->map(fn (Enrollment $enrollment) => [
                'id' => $enrollment->id,
                'progress_percent' => (string) $enrollment->progress_percent,
                'enrolled_at' => $enrollment->enrolled_at?->toIso8601String(),
                'completed_at' => $enrollment->completed_at?->toIso8601String(),
                'course' => $enrollment->course ? [
                    'id' => $enrollment->course->id,
                    'title' => $enrollment->course->title,
                    'slug' => $enrollment->course->slug,
                    'excerpt' => $enrollment->course->excerpt,
                    'thumbnail_path' => $enrollment->course->thumbnail_path,
                    'duration_label' => $enrollment->course->duration_label,
                    'lesson_count_label' => $enrollment->course->lesson_count_label,
                ] : null,
            ])
            ->all();
    }
}
