<?php

namespace App\Contracts\Student;

use App\Models\Enrollment;
use App\Models\Student;

interface StudentSyncServiceInterface
{
    public function syncFromEnrollment(Enrollment $enrollment): Student;

    public function generateStudentCode(): string;
}
