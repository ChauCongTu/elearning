<?php

namespace App\Services\Student;

use App\Contracts\Student\StudentSyncServiceInterface;
use App\Enums\StudentSource;
use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Support\Facades\DB;

class StudentSyncService implements StudentSyncServiceInterface
{
    public function syncFromEnrollment(Enrollment $enrollment): Student
    {
        $enrollment->loadMissing(['user', 'course']);

        $user = $enrollment->user;
        $course = $enrollment->course;

        $existing = Student::query()->where('enrollment_id', $enrollment->id)->first();

        $studentCode = $existing?->student_code ?? $this->generateStudentCode();

        $birthday = null;

        if ($user?->birth_year) {
            $birthday = sprintf('%d-01-01', $user->birth_year);
        }

        $attributes = [
            'name' => $user?->name ?? 'Học viên',
            'student_code' => $studentCode,
            'cmnd' => $user?->cmnd,
            'birthday' => $birthday,
            'course' => $course?->title,
            'class_name' => 'Online',
            'graduation_date' => $enrollment->completed_at?->toDateString(),
            'type' => 'X',
            'user_id' => $enrollment->user_id,
            'course_id' => $enrollment->course_id,
            'source' => StudentSource::Online,
        ];

        if ($existing) {
            $existing->update($attributes);

            return $existing->fresh();
        }

        return Student::query()->create([
            ...$attributes,
            'enrollment_id' => $enrollment->id,
        ]);
    }

    public function generateStudentCode(): string
    {
        $year = now()->year;
        $prefix = "ELN{$year}-";

        return DB::transaction(function () use ($prefix, $year) {
            $latest = Student::query()
                ->where('student_code', 'like', "{$prefix}%")
                ->lockForUpdate()
                ->orderByDesc('student_code')
                ->value('student_code');

            $next = 1;

            if ($latest !== null && preg_match('/ELN\d{4}-(\d+)$/', $latest, $matches)) {
                $next = ((int) $matches[1]) + 1;
            }

            return sprintf('%s%04d', $prefix, $next);
        });
    }
}
