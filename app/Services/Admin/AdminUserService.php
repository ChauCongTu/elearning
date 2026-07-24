<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminUserServiceInterface;
use App\Contracts\Mail\TransactionalMailServiceInterface;
use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\UserRole;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AdminUserService implements AdminUserServiceInterface
{
    public function __construct(
        private TransactionalMailServiceInterface $transactionalMail,
    ) {}

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
            'students' => fn ($query) => $query->orderByDesc('created_at'),
        ]);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'role' => $user->role->value,
            'can_complete_orders' => (bool) $user->can_complete_orders,
            'is_root_account' => $user->isRoot(),
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
            'students' => $user->students->map(fn (Student $student) => [
                'id' => $student->id,
                'stt' => $student->stt,
                'name' => $student->name,
                'student_code' => $student->student_code,
                'cmnd' => $student->cmnd,
                'cmnd_issue_date' => $student->cmnd_issue_date?->format('Y-m-d'),
                'cmnd_issue_place' => $student->cmnd_issue_place,
                'birthday' => $student->birthday?->format('Y-m-d'),
                'original_place' => $student->original_place,
                'ethnic' => $student->ethnic,
                'course' => $student->course,
                'class_name' => $student->class_name,
                'graduation_date' => $student->graduation_date?->format('Y-m-d'),
                'type' => $student->type,
                'source' => $student->source?->value,
                'user_id' => $student->user_id,
                'course_id' => $student->course_id,
                'enrollment_id' => $student->enrollment_id,
                'is_revoked' => $student->is_revoked,
                'created_at' => $student->created_at?->toIso8601String(),
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

        $previousRole = $user->role;
        $user->update(['role' => $newRole]);
        $user = $user->fresh();

        $this->transactionalMail->sendRoleChanged($user, $previousRole, $newRole);

        return $user;
    }

    public function updateOrderCompletionPermission(User $user, bool $allowed, User $actor): User
    {
        if (! $actor->isRoot()) {
            throw ValidationException::withMessages([
                'can_complete_orders' => 'Chỉ tài khoản root mới được cấp quyền này.',
            ]);
        }

        if ($user->isRoot()) {
            throw ValidationException::withMessages([
                'can_complete_orders' => 'Không thể thay đổi quyền của tài khoản root.',
            ]);
        }

        if (! $user->isAdmin()) {
            throw ValidationException::withMessages([
                'can_complete_orders' => 'Chỉ áp dụng cho tài khoản quản trị.',
            ]);
        }

        $user->update(['can_complete_orders' => $allowed]);

        return $user->fresh();
    }

    public function grantEnrollment(User $user, Course $course, User $actor): Enrollment
    {
        if (! $actor->canCompleteOrders()) {
            throw ValidationException::withMessages([
                'enrollment' => 'Bạn không có quyền cấp học thủ công.',
            ]);
        }

        $enrollment = Enrollment::query()->updateOrCreate(
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

        $enrollment->load('course');
        $this->transactionalMail->sendEnrollmentGranted($user, $enrollment);

        return $enrollment;
    }

    public function create(array $data, User $actor): array
    {
        $role = UserRole::from($data['role']);
        $grantOrderOps = $role === UserRole::Admin && ($data['can_complete_orders'] ?? false);

        if ($grantOrderOps && ! $actor->isRoot()) {
            throw ValidationException::withMessages([
                'can_complete_orders' => 'Chỉ tài khoản root mới được cấp quyền vận hành khi tạo admin.',
            ]);
        }

        $generatedPassword = Str::password(12, symbols: true);

        $user = User::query()->create([
            'name' => trim($data['name']),
            'email' => strtolower(trim($data['email'])),
            'phone' => isset($data['phone']) && $data['phone'] !== '' ? $data['phone'] : null,
            'password' => $generatedPassword,
            'role' => $role,
            'can_complete_orders' => $grantOrderOps,
            'must_change_password' => (bool) ($data['must_change_password'] ?? true),
            'email_verified_at' => now(),
        ]);

        return [
            'user' => $user,
            'generated_password' => $generatedPassword,
        ];
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
