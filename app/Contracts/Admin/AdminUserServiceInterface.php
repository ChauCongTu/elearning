<?php

namespace App\Contracts\Admin;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AdminUserServiceInterface
{
    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function show(User $user): array;

    public function updateRole(User $user, string $role, User $actor): User;

    public function updateOrderCompletionPermission(User $user, bool $allowed, User $actor): User;

    public function grantEnrollment(User $user, Course $course, User $actor): Enrollment;

    /**
     * @param  array{name: string, email: string, phone?: string|null, role: string, can_complete_orders?: bool, must_change_password?: bool}  $data
     * @return array{user: User, generated_password: string}
     */
    public function create(array $data, User $actor): array;
}
