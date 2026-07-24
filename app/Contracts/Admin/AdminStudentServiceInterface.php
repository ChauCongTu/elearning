<?php

namespace App\Contracts\Admin;

use App\Models\Student;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AdminStudentServiceInterface
{
    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * @return array<string, mixed>
     */
    public function show(Student $student): array;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Student;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Student $student, array $data): Student;

    /**
     * @return array<string, mixed>
     */
    public function filterOptions(): array;

    /**
     * @return array<string, mixed>
     */
    public function formOptions(): array;

    /**
     * @return array<int, array{id: string, name: string, email: string}>
     */
    public function searchUsers(string $keyword, int $limit = 15): array;

    /**
     * @return array<int, array<string, mixed>>
     */
    public function listForUser(string $userId): array;
}
