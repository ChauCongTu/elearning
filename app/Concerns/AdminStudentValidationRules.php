<?php

namespace App\Concerns;

use App\Enums\StudentSource;
use App\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

trait AdminStudentValidationRules
{
    /**
     * @return array<string, mixed>
     */
    protected function validateAdminStudent(Request $request, ?string $studentId = null): array
    {
        $uniqueRule = $studentId
            ? 'unique:students,student_code,'.$studentId
            : 'unique:students,student_code';

        $data = $request->validate([
            'stt' => ['nullable', 'integer', 'min:0'],
            'name' => ['required', 'string', 'max:255'],
            'student_code' => ['nullable', 'string', 'max:50', $uniqueRule, 'required_without:auto_generate_code'],
            'auto_generate_code' => ['nullable', 'boolean'],
            'cmnd' => ['nullable', 'string', 'max:20'],
            'cmnd_issue_date' => ['nullable', 'date'],
            'cmnd_issue_place' => ['nullable', 'string', 'max:255'],
            'birthday' => ['nullable', 'date'],
            'original_place' => ['nullable', 'string', 'max:255'],
            'ethnic' => ['nullable', 'string', 'max:100'],
            'course' => ['nullable', 'string', 'max:255'],
            'class_name' => ['nullable', 'string', 'max:255'],
            'graduation_date' => ['nullable', 'date'],
            'type' => ['nullable', 'string', 'max:10'],
            'user_id' => ['nullable', 'uuid', 'exists:users,id'],
            'course_id' => ['nullable', 'uuid', 'exists:courses,id'],
            'enrollment_id' => ['nullable', 'uuid', 'exists:enrollments,id'],
            'source' => ['nullable', Rule::enum(StudentSource::class)],
        ], [
            'name.required' => 'Vui lòng nhập họ tên.',
            'student_code.required_without' => 'Vui lòng nhập mã học viên hoặc chọn tự sinh mã.',
            'student_code.unique' => 'Mã học viên đã tồn tại.',
            'user_id.exists' => 'Tài khoản liên kết không hợp lệ.',
            'course_id.exists' => 'Khóa học liên kết không hợp lệ.',
            'enrollment_id.exists' => 'Ghi danh liên kết không hợp lệ.',
        ]);

        if (! empty($data['enrollment_id'])) {
            $enrollment = Enrollment::query()->find($data['enrollment_id']);

            if ($enrollment !== null) {
                if (! empty($data['user_id']) && $enrollment->user_id !== $data['user_id']) {
                    throw ValidationException::withMessages([
                        'enrollment_id' => 'Ghi danh không thuộc tài khoản đã chọn.',
                    ]);
                }

                if (! empty($data['course_id']) && $enrollment->course_id !== $data['course_id']) {
                    throw ValidationException::withMessages([
                        'enrollment_id' => 'Ghi danh không khớp khóa học đã chọn.',
                    ]);
                }
            }
        }

        return $data;
    }
}
