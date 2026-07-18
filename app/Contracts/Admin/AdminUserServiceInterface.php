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

    public function grantEnrollment(User $user, Course $course): Enrollment;
}
