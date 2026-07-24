<?php

namespace App\Jobs;

use App\Contracts\Student\CertificateServiceInterface;
use App\Models\Enrollment;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class IssueCertificateJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $enrollmentId,
    ) {}

    public function handle(CertificateServiceInterface $certificates): void
    {
        $enrollment = Enrollment::query()->find($this->enrollmentId);

        if (! $enrollment || ! $enrollment->isCompleted()) {
            return;
        }

        if ($enrollment->certificate()->exists()) {
            return;
        }

        try {
            $certificates->issue($enrollment);
        } catch (\Throwable $exception) {
            Log::error('IssueCertificateJob failed', [
                'enrollment_id' => $this->enrollmentId,
                'message' => $exception->getMessage(),
            ]);

            throw $exception;
        }
    }
}
