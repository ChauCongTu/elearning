<?php

namespace App\Support;

use App\Models\Course;
use App\Models\Student;
use Carbon\CarbonInterface;

class CertificatePlaceholders
{
    /**
     * @return array<string, string>
     */
    public static function forStudent(Student $student, ?Course $course = null): array
    {
        $graduationDate = $student->graduation_date;

        return [
            'name' => $student->name,
            'student_code' => $student->student_code,
            'course' => $student->course ?? $course?->title ?? '',
            'course_title' => $student->course ?? $course?->title ?? '',
            'class_name' => $student->class_name ?? '',
            'cmnd' => $student->cmnd ?? '',
            'birthday' => self::formatDate($student->birthday),
            'graduation_date' => self::formatDate($graduationDate),
            'graduation_date_formatted' => self::formatDate($graduationDate),
            'issued_at' => self::formatDate($graduationDate ?? now()),
            'issued_at_formatted' => self::formatDate($graduationDate ?? now()),
            'organization' => (string) config('certificate.organization_name', config('app.name')),
            'organization_short' => (string) config('certificate.organization_short', config('app.name')),
            'year' => (string) now()->year,
        ];
    }

    public static function apply(string $template, array $placeholders): string
    {
        $replacements = [];

        foreach ($placeholders as $key => $value) {
            $replacements['{{'.$key.'}}'] = $value;
            $replacements['{{ '.$key.' }}'] = $value;
        }

        return strtr($template, $replacements);
    }

    private static function formatDate(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '';
        }

        if ($value instanceof CarbonInterface) {
            return $value->format('d/m/Y');
        }

        try {
            return \Illuminate\Support\Carbon::parse($value)->format('d/m/Y');
        } catch (\Throwable) {
            return (string) $value;
        }
    }
}
