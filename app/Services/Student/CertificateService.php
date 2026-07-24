<?php

namespace App\Services\Student;

use App\Contracts\Student\CertificateServiceInterface;
use App\Contracts\Student\CertificateTemplateRendererInterface;
use App\Contracts\Student\StudentSyncServiceInterface;
use App\Enums\FilePrefix;
use App\Notifications\StudentCertificateNotification;
use App\Models\Certificate;
use App\Models\Enrollment;
use Illuminate\Support\Facades\Storage;

class CertificateService implements CertificateServiceInterface
{
    public function __construct(
        private StudentSyncServiceInterface $studentSync,
        private CertificateTemplateRendererInterface $templateRenderer,
    ) {}

    public function issue(Enrollment $enrollment): Certificate
    {
        $enrollment->loadMissing(['user', 'course', 'certificate']);

        $student = $this->studentSync->syncFromEnrollment($enrollment);

        if ($certificate = $enrollment->certificate) {
            if (! $certificate->student_id) {
                $certificate->update(['student_id' => $student->id]);
            }

            return $certificate->fresh(['student', 'enrollment.user']);
        }

        $filePath = $this->renderPdf($student, $enrollment->course);

        $certificate = Certificate::query()->create([
            'enrollment_id' => $enrollment->id,
            'student_id' => $student->id,
            'file_path' => $filePath,
            'issued_at' => now(),
        ]);

        $this->sendStudentCodeEmail($certificate);

        return $certificate->fresh(['student', 'enrollment.user']);
    }

    public function regeneratePdf(Certificate $certificate): Certificate
    {
        $certificate->loadMissing(['student', 'enrollment.course']);

        if (! $certificate->student) {
            throw new \RuntimeException('Chứng chỉ chưa liên kết học viên.');
        }

        $oldPath = $certificate->file_path;
        $filePath = $this->renderPdf($certificate->student, $certificate->enrollment?->course);

        $certificate->update([
            'file_path' => $filePath,
            'issued_at' => $certificate->issued_at ?? now(),
        ]);

        if ($oldPath && $oldPath !== $filePath) {
            Storage::disk(config('filesystems.upload_disk', 'public'))->delete($oldPath);
        }

        return $certificate->fresh();
    }

    public function sendStudentCodeEmail(Certificate $certificate, bool $force = false): void
    {
        if (! $force && $certificate->certificate_email_sent_at !== null) {
            return;
        }

        $certificate->loadMissing(['student', 'enrollment.user']);

        $student = $certificate->student;
        $user = $certificate->enrollment?->user;

        if (! $student || ! $user?->email) {
            return;
        }

        $pdfPath = null;

        if (config('certificate.email_attach_pdf', false)) {
            $pdfPath = $this->downloadPath($certificate);

            if ($pdfPath !== null && ! file_exists($pdfPath)) {
                $pdfPath = null;
            }
        }

        $user->notify(new StudentCertificateNotification($student, $pdfPath));

        $certificate->update(['certificate_email_sent_at' => now()]);
    }

    public function downloadPath(Certificate $certificate): ?string
    {
        if (! $certificate->file_path) {
            return null;
        }

        $disk = Storage::disk(config('filesystems.upload_disk', 'public'));

        if (! $disk->exists($certificate->file_path)) {
            return null;
        }

        return method_exists($disk, 'path') ? $disk->path($certificate->file_path) : null;
    }

    public function fileContents(Certificate $certificate): ?string
    {
        if (! $certificate->file_path) {
            return null;
        }

        $disk = Storage::disk(config('filesystems.upload_disk', 'public'));

        return $disk->exists($certificate->file_path)
            ? $disk->get($certificate->file_path)
            : null;
    }

    private function renderPdf(\App\Models\Student $student, ?\App\Models\Course $course = null): string
    {
        $pdfBinary = $this->templateRenderer->render($student, $course);

        $directory = trim(FilePrefix::Certificate->value, '/');
        $disk = config('filesystems.upload_disk', 'public');
        $filename = sprintf('%s/%s.pdf', $directory, $student->student_code);

        Storage::disk($disk)->put($filename, $pdfBinary);

        return $filename;
    }
}
