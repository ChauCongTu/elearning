<?php

namespace App\Contracts\Student;

use App\Models\Enrollment;
use App\Models\Student;
use Illuminate\Support\Collection;

interface StudentLookupServiceInterface
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function searchPublic(string $keyword): Collection;

    /**
     * @return array{success: bool, data: array<int, array<string, mixed>>, total: int, message: string}
     */
    public function searchApi(string $keyword): array;

    /**
     * @return array<string, mixed>
     */
    public function toLegacyArray(Student $student, bool $includeStatus = false): array;

    /**
     * @return array{imported: int, skipped: int, errors: array<int, string>}
     */
    public function importFromCsv(string $path): array;

    public function revoke(Student $student): void;

    public function restore(Student $student): void;
}
