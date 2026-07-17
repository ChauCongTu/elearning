<?php

namespace App\Contracts\Enrollment;

use App\Models\User;

interface EnrollmentServiceInterface
{
    /**
     * @return list<array<string, mixed>>
     */
    public function listActiveForUser(User $user): array;
}
