<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminUserServiceInterface;
use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\UserRole;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class AdminUserService implements AdminUserServiceInterface
{
    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = User::query()->orderByDesc('created_at');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        return $query->paginate($perPage)->withQueryString()->through(fn (User $user) => $this->toListArray($user));
    }

    public function show(User $user): array
    {
        $user->load([
            'enrollments.course:id,title,slug',
        ]);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role->value,
            'created_at' => $user->created_at?->toIso8601String(),
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'enrollments' => $user->enrollments->map(fn (Enrollment $e) => [
                'id' => $e->id,
                'status' => $e->status->value,
                'source' => $e->source->value,
                'progress_percent' => (string) $e->progress_percent,
                'enrolled_at' => $e->enrolled_at?->toIso8601String(),
                'course' => $e->course ? [
                    'id' => $e->course->id,
                    'title' => $e->course->title,
                    'slug' => $e->course->slug,
                ] : null,
            ])->all(),
        ];
    }

    public function updateRole(User $user, string $role, User $actor): User
    {
        $newRole = UserRole::from($role);

        if ($actor->id === $user->id && $user->isAdmin() && $newRole !== UserRole::Admin) {
            throw ValidationException::withMessages([
                'role' => 'Bạn không thể tự hạ quyền quản trị của chính mình.',
            ]);
        }

        $user->update(['role' => $newRole]);

        return $user->fresh();
    }

    public function grantEnrollment(User $user, Course $course): Enrollment
    {
        return Enrollment::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'course_id' => $course->id,
            ],
            [
                'status' => EnrollmentStatus::Active,
                'source' => EnrollmentSource::Manual,
                'enrolled_at' => now(),
                'progress_percent' => 0,
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function toListArray(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role->value,
            'created_at' => $user->created_at?->toIso8601String(),
            'last_login_at' => $user->last_login_at?->toIso8601String(),
        ];
    }
}
