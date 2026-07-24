<?php

namespace App\Http\Controllers\Account;

use App\Contracts\Student\CertificateServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Certificate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CertificateController extends Controller
{
    public function __construct(
        private CertificateServiceInterface $certificates,
    ) {}

    public function index(Request $request): Response
    {
        $certificates = Certificate::query()
            ->with(['student', 'enrollment.course'])
            ->whereHas('enrollment', fn ($query) => $query->where('user_id', $request->user()->id))
            ->orderByDesc('issued_at')
            ->get()
            ->map(fn (Certificate $certificate) => [
                'id' => $certificate->id,
                'student_code' => $certificate->student?->student_code,
                'course_title' => $certificate->enrollment?->course?->title ?? $certificate->student?->course,
                'issued_at' => $certificate->issued_at?->toIso8601String(),
                'lookup_url' => $certificate->student
                    ? url('/thong-tin?q='.urlencode($certificate->student->student_code))
                    : null,
            ]);

        return Inertia::render('account/certificates', [
            'certificates' => $certificates,
        ]);
    }

    public function download(Request $request, Certificate $certificate): StreamedResponse
    {
        abort_unless(
            $certificate->enrollment?->user_id === $request->user()->id,
            403,
        );

        abort_unless($certificate->file_path !== null, 404);

        $disk = Storage::disk(config('filesystems.upload_disk', 'public'));

        abort_unless($disk->exists($certificate->file_path), 404);

        $studentCode = $certificate->student?->student_code ?? $certificate->id;

        return $disk->download($certificate->file_path, 'chung-chi-'.$studentCode.'.pdf');
    }
}
