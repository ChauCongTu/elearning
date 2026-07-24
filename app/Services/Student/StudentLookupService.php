<?php

namespace App\Services\Student;

use App\Contracts\Student\StudentLookupServiceInterface;
use App\Enums\StudentSource;
use App\Models\Student;
use App\Support\CmndIssuePlace;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StudentLookupService implements StudentLookupServiceInterface
{
    private const CSV_HEADERS = [
        'stt',
        'name',
        'student_code',
        'cmnd',
        'cmnd_issue_date',
        'cmnd_issue_place',
        'birthday',
        'original_place',
        'ethnic',
        'course',
        'class_name',
        'graduation_date',
    ];

    public function searchPublic(string $keyword): Collection
    {
        $keyword = trim($keyword);

        if ($keyword === '') {
            return collect();
        }

        return Student::query()
            ->where(function ($query) use ($keyword) {
                foreach (['name', 'student_code', 'cmnd', 'course', 'class_name'] as $column) {
                    $query->orWhere($column, $keyword);
                }
            })
            ->orderBy('name')
            ->limit(50)
            ->get()
            ->map(fn (Student $student) => $this->toPublicArray($student));
    }

    public function searchApi(string $keyword): array
    {
        $keyword = trim($keyword);

        if ($keyword === '') {
            return [
                'success' => true,
                'data' => [],
                'total' => 0,
                'message' => 'Vui lòng nhập từ khóa tìm kiếm',
            ];
        }

        $students = Student::query()
            ->where(function ($query) use ($keyword) {
                foreach (['name', 'student_code', 'cmnd', 'course', 'class_name'] as $column) {
                    $query->orWhere($column, $keyword);
                }
            })
            ->orderBy('name')
            ->limit(50)
            ->get();

        $data = $students
            ->map(fn (Student $student) => $this->toLegacyArray($student, true))
            ->values()
            ->all();

        $total = count($data);
        $message = $total > 0
            ? "Tìm thấy {$total} kết quả"
            : 'Không tìm thấy kết quả phù hợp';

        return [
            'success' => true,
            'data' => $data,
            'total' => $total,
            'message' => $message,
        ];
    }

    public function toLegacyArray(Student $student, bool $includeStatus = false): array
    {
        $data = [
            'id' => $student->id,
            'stt' => $student->stt,
            'name' => $student->name,
            'student_code' => $student->student_code,
            'cmnd' => $student->cmnd,
            'cmnd_issue_date' => $student->cmnd_issue_date?->format('Y-m-d'),
            'cmnd_issue_place' => $student->cmnd_issue_place,
            'birthday' => $student->birthday?->format('Y-m-d'),
            'original_place' => $student->original_place,
            'ethnic' => $student->ethnic,
            'course' => $student->course,
            'class_name' => $student->class_name,
            'graduation_date' => $student->graduation_date?->format('Y-m-d'),
            'type' => $student->type,
            'created_at' => $student->created_at?->toIso8601String(),
            'updated_at' => $student->updated_at?->toIso8601String(),
        ];

        if ($includeStatus && $student->isRevoked()) {
            $data['status'] = 'revoked';
        }

        return $data;
    }

    public function importFromCsv(string $path): array
    {
        $handle = fopen($path, 'r');

        if ($handle === false) {
            return ['imported' => 0, 'skipped' => 0, 'errors' => ['Không thể đọc file CSV.']];
        }

        $header = fgetcsv($handle);

        if ($header === false) {
            fclose($handle);

            return ['imported' => 0, 'skipped' => 0, 'errors' => ['File CSV trống.']];
        }

        $header = array_map(fn ($value) => Str::lower(trim((string) $value)), $header);

        if ($header !== self::CSV_HEADERS) {
            fclose($handle);

            return [
                'imported' => 0,
                'skipped' => 0,
                'errors' => ['Header CSV không đúng định dạng legacy (12 cột).'],
            ];
        }

        $imported = 0;
        $skipped = 0;
        $errors = [];
        $line = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $line++;

            if ($this->isEmptyRow($row)) {
                continue;
            }

            if (count($row) !== count(self::CSV_HEADERS)) {
                $errors[] = "Dòng {$line}: số cột không hợp lệ.";
                $skipped++;

                continue;
            }

            $data = array_combine(self::CSV_HEADERS, array_map(
                fn ($value) => trim((string) $value),
                $row,
            ));

            if ($data['name'] === '' || $data['student_code'] === '') {
                $errors[] = "Dòng {$line}: thiếu name hoặc student_code.";
                $skipped++;

                continue;
            }

            if (Student::query()->where('student_code', $data['student_code'])->exists()) {
                $errors[] = "Dòng {$line}: mã học viên {$data['student_code']} đã tồn tại.";
                $skipped++;

                continue;
            }

            try {
                Student::query()->create([
                    'stt' => $data['stt'] !== '' ? (int) $data['stt'] : null,
                    'name' => $data['name'],
                    'student_code' => $data['student_code'],
                    'cmnd' => $data['cmnd'] !== '' ? $data['cmnd'] : null,
                    'cmnd_issue_date' => $this->parseDate($data['cmnd_issue_date']),
                    'cmnd_issue_place' => $data['cmnd_issue_place'] !== '' ? $data['cmnd_issue_place'] : null,
                    'birthday' => $this->parseDate($data['birthday']),
                    'original_place' => $data['original_place'] !== '' ? $data['original_place'] : null,
                    'ethnic' => $data['ethnic'] !== '' ? $data['ethnic'] : null,
                    'course' => $data['course'] !== '' ? $data['course'] : null,
                    'class_name' => $data['class_name'] !== '' ? $data['class_name'] : null,
                    'graduation_date' => $this->parseDate($data['graduation_date']),
                    'type' => 'X',
                    'source' => StudentSource::Import,
                ]);

                $imported++;
            } catch (\Throwable $exception) {
                $errors[] = "Dòng {$line}: {$exception->getMessage()}";
                $skipped++;
            }
        }

        fclose($handle);

        return compact('imported', 'skipped', 'errors');
    }

    public function revoke(Student $student): void
    {
        $student->update([
            'is_revoked' => true,
            'revoked_at' => now(),
        ]);
    }

    public function restore(Student $student): void
    {
        $student->update([
            'is_revoked' => false,
            'revoked_at' => null,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function toPublicArray(Student $student): array
    {
        $age = $student->birthday
            ? $student->birthday->age
            : null;

        return [
            ...$this->toLegacyArray($student),
            'age' => $age,
            'cmnd_issue_place_label' => CmndIssuePlace::label($student->cmnd_issue_place),
            'is_revoked' => $student->isRevoked(),
        ];
    }

    private function parseDate(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $value = trim($value);

        foreach (['Y-m-d', 'd/m/Y', 'd-m-Y'] as $format) {
            try {
                return Carbon::createFromFormat($format, $value)->format('Y-m-d');
            } catch (\Throwable) {
                continue;
            }
        }

        throw new \InvalidArgumentException("Ngày không hợp lệ: {$value}");
    }

    /**
     * @param  array<int, string|null>  $row
     */
    private function isEmptyRow(array $row): bool
    {
        return collect($row)->every(fn ($value) => trim((string) $value) === '');
    }
}
