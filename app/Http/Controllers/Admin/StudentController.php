<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\AdminStudentValidationRules;
use App\Contracts\Admin\AdminStudentServiceInterface;
use App\Contracts\Student\CertificateServiceInterface;
use App\Contracts\Student\StudentLookupServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StudentController extends Controller
{
    use AdminStudentValidationRules;

    public function __construct(
        private AdminStudentServiceInterface $students,
        private StudentLookupServiceInterface $lookup,
        private CertificateServiceInterface $certificates,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('admin/students/index', [
            'students' => $this->students->paginateForAdmin($request->only([
                'search',
                'course',
                'class_name',
                'original_place',
                'is_revoked',
            ])),
            'filters' => $request->only(['search', 'course', 'class_name', 'original_place', 'is_revoked']),
            'filterOptions' => $this->students->filterOptions(),
            'formOptions' => $this->students->formOptions(),
        ]);
    }

    public function show(Student $student): Response
    {
        return Inertia::render('admin/students/show', [
            'student' => $this->students->show($student),
            'formOptions' => $this->students->formOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateAdminStudent($request);

        $this->students->create($data);

        return back()->with('success', 'Đã thêm học viên.');
    }

    public function update(Request $request, Student $student): RedirectResponse
    {
        $data = $this->validateAdminStudent($request, $student->id);

        $this->students->update($student, $data);

        return back()->with('success', 'Đã cập nhật học viên.');
    }

    public function searchUsers(Request $request): JsonResponse
    {
        return response()->json([
            'users' => $this->students->searchUsers((string) $request->query('q', '')),
        ]);
    }

    public function import(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ], [
            'file.required' => 'Vui lòng chọn file CSV.',
        ]);

        $result = $this->lookup->importFromCsv($request->file('file')->getRealPath());

        $message = "Import xong: {$result['imported']} thành công, {$result['skipped']} bỏ qua.";

        if (! empty($result['errors'])) {
            return back()->with('success', $message)->with('import_errors', array_slice($result['errors'], 0, 10));
        }

        return back()->with('success', $message);
    }

    public function downloadSample(): StreamedResponse
    {
        $headers = 'stt,name,student_code,cmnd,cmnd_issue_date,cmnd_issue_place,birthday,original_place,ethnic,course,class_name,graduation_date';

        return response()->streamDownload(function () use ($headers) {
            echo $headers."\n";
            echo '1,Nguyễn Văn An,SV001,123456789,2020-01-15,Hà Nội,1995-05-20,Hà Nội,Kinh,Khóa phun xăm cơ bản,CNTT01,2023-06-15';
        }, 'mau_import_hoc_vien.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function revoke(Student $student): RedirectResponse
    {
        $this->lookup->revoke($student);

        return back()->with('success', 'Đã thu hồi tra cứu học viên.');
    }

    public function restore(Student $student): RedirectResponse
    {
        $this->lookup->restore($student);

        return back()->with('success', 'Đã khôi phục tra cứu học viên.');
    }

    public function resendEmail(Student $student): RedirectResponse
    {
        $student->load('certificate');

        if (! $student->certificate) {
            return back()->with('error', 'Học viên chưa có chứng chỉ PDF.');
        }

        $this->certificates->sendStudentCodeEmail($student->certificate, force: true);

        return back()->with('success', 'Đã gửi lại email mã tra cứu.');
    }

    public function downloadCertificate(Student $student): HttpResponse|RedirectResponse|StreamedResponse
    {
        $student->load('certificate');

        if (! $student->certificate) {
            return back()->with('error', 'Không tìm thấy chứng chỉ PDF.');
        }

        $path = $this->certificates->downloadPath($student->certificate);

        if ($path !== null && file_exists($path)) {
            return response()->download($path, 'chung-chi-'.$student->student_code.'.pdf');
        }

        $disk = \Illuminate\Support\Facades\Storage::disk(config('filesystems.upload_disk', 'public'));

        if ($student->certificate->file_path && $disk->exists($student->certificate->file_path)) {
            return $disk->download($student->certificate->file_path, 'chung-chi-'.$student->student_code.'.pdf');
        }

        return back()->with('error', 'File PDF không tồn tại.');
    }
}
