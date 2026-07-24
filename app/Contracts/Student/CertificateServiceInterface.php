<?php

namespace App\Contracts\Student;

use App\Models\Certificate;
use App\Models\Enrollment;

interface CertificateServiceInterface
{
    public function issue(Enrollment $enrollment): Certificate;

    public function regeneratePdf(Certificate $certificate): Certificate;

    public function sendStudentCodeEmail(Certificate $certificate, bool $force = false): void;

    public function downloadPath(Certificate $certificate): ?string;
}
