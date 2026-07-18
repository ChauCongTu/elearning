<?php

namespace App\Contracts\Admin;

use App\Models\Course;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AdminCourseServiceInterface
{
    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function findForAdmin(string $id): array;

    public function create(array $data): Course;

    public function update(Course $course, array $data): Course;

    public function delete(Course $course): void;
}
