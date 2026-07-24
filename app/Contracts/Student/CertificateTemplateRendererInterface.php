<?php

namespace App\Contracts\Student;

use App\Models\Course;
use App\Models\Student;

interface CertificateTemplateRendererInterface
{
    public function render(Student $student, ?Course $course = null): string;

    /**
     * @return array<int, string>
     */
    public function availablePlaceholders(): array;
}
