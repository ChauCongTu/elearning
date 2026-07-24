<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminStudentServiceInterface;
use App\Contracts\Student\StudentSyncServiceInterface;
use App\Enums\StudentSource;
use App\Models\Course;
use App\Models\Student;
use App\Models\User;
use App\Support\CmndIssuePlace;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Validation\ValidationException;

class AdminStudentService implements AdminStudentServiceInterface
{
    public function __construct(
        private StudentSyncServiceInterface $sync,
    ) {}

    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Student::query()
            ->with('user:id,name,email')
            ->orderByDesc('created_at');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('student_code', 'like', "%{$search}%")
                    ->orWhere('cmnd', 'like', "%{$search}%");
            });
        }

        foreach (['course', 'class_name', 'original_place'] as $column) {
            if (! empty($filters[$column])) {
                $query->where($column, $filters[$column]);
            }
        }

        if (isset($filters['is_revoked']) && $filters['is_revoked'] !== '' && $filters['is_revoked'] !== null) {
            $query->where('is_revoked', filter_var($filters['is_revoked'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn (Student $student) => $this->toListArray($student));
    }

    public function show(Student $student): array
    {
        $student->load([
            'user:id,name,email,phone,cmnd,birth_year',
            'courseRelation:id,title,slug',
            'enrollment.course:id,title,slug',
            'certificate',
        ]);

        return [
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
            'source' => $student->source?->value,
            'user_id' => $student->user_id,
            'course_id' => $student->course_id,
            'enrollment_id' => $student->enrollment_id,
            'user' => $student->user ? [
                'id' => $student->user->id,
                'name' => $student->user->name,
                'email' => $student->user->email,
                'phone' => $student->user->phone,
            ] : null,
            'linked_course' => $student->courseRelation ? [
                'id' => $student->courseRelation->id,
                'title' => $student->courseRelation->title,
            ] : null,
            'enrollment' => $student->enrollment ? [
                'id' => $student->enrollment->id,
                'status' => $student->enrollment->status->value,
                'course' => $student->enrollment->course ? [
                    'id' => $student->enrollment->course->id,
                    'title' => $student->enrollment->course->title,
                ] : null,
            ] : null,
            'is_revoked' => $student->is_revoked,
            'revoked_at' => $student->revoked_at?->toIso8601String(),
            'created_at' => $student->created_at?->toIso8601String(),
            'has_certificate' => $student->certificate !== null,
            'certificate_id' => $student->certificate?->id,
            'certificate_email_sent_at' => $student->certificate?->certificate_email_sent_at?->toIso8601String(),
        ];
    }

    public function create(array $data): Student
    {
        $payload = $this->preparePayload($data);

        if (! empty($payload['enrollment_id'])) {
            $exists = Student::query()->where('enrollment_id', $payload['enrollment_id'])->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'enrollment_id' => 'Ghi danh này đã có hồ sơ tra cứu.',
                ]);
            }
        }

        return Student::query()->create($payload);
    }

    public function update(Student $student, array $data): Student
    {
        $payload = $this->preparePayload($data, $student);

        if (! empty($payload['enrollment_id']) && $payload['enrollment_id'] !== $student->enrollment_id) {
            $exists = Student::query()
                ->where('enrollment_id', $payload['enrollment_id'])
                ->where('id', '!=', $student->id)
                ->exists();

            if ($exists) {
                throw ValidationException::withMessages([
                    'enrollment_id' => 'Ghi danh này đã có hồ sơ tra cứu.',
                ]);
            }
        }

        $student->update($payload);

        return $student->fresh();
    }

    public function filterOptions(): array
    {
        return [
            'courses' => Student::query()->whereNotNull('course')->distinct()->orderBy('course')->pluck('course')->all(),
            'class_names' => Student::query()->whereNotNull('class_name')->distinct()->orderBy('class_name')->pluck('class_name')->all(),
            'original_places' => Student::query()->whereNotNull('original_place')->distinct()->orderBy('original_place')->pluck('original_place')->all(),
        ];
    }

    public function formOptions(): array
    {
        return [
            'courses' => Course::query()
                ->orderBy('title')
                ->get(['id', 'title'])
                ->map(fn (Course $course) => [
                    'id' => $course->id,
                    'title' => $course->title,
                ])
                ->all(),
            'sources' => collect(StudentSource::cases())->map(fn (StudentSource $source) => [
                'value' => $source->value,
                'label' => $source->label(),
            ])->all(),
            'cmnd_issue_places' => [
                ['value' => 'C1', 'label' => CmndIssuePlace::label('C1')],
                ['value' => 'C2', 'label' => CmndIssuePlace::label('C2')],
            ],
        ];
    }

    public function searchUsers(string $keyword, int $limit = 15): array
    {
        $keyword = trim($keyword);

        if ($keyword === '') {
            return [];
        }

        return User::query()
            ->where(function ($query) use ($keyword) {
                $query->where('name', 'like', "%{$keyword}%")
                    ->orWhere('email', 'like', "%{$keyword}%")
                    ->orWhere('phone', 'like', "%{$keyword}%");
            })
            ->orderBy('name')
            ->limit($limit)
            ->get(['id', 'name', 'email'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ])
            ->all();
    }

    public function listForUser(string $userId): array
    {
        return Student::query()
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Student $student) => $this->toListArray($student))
            ->all();
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    private function preparePayload(array $data, ?Student $existing = null): array
    {
        $autoGenerate = ! empty($data['auto_generate_code']);
        unset($data['auto_generate_code']);

        if (empty($data['student_code']) && $autoGenerate) {
            $data['student_code'] = $this->sync->generateStudentCode();
        }

        foreach (['user_id', 'course_id', 'enrollment_id'] as $key) {
            if (array_key_exists($key, $data) && ($data[$key] === '' || $data[$key] === null)) {
                $data[$key] = null;
            }
        }

        if (! empty($data['course_id'])) {
            $course = Course::query()->find($data['course_id']);

            if ($course !== null && empty($data['course'])) {
                $data['course'] = $course->title;
            }
        }

        if (! empty($data['user_id']) && $existing === null) {
            $user = User::query()->find($data['user_id']);

            if ($user !== null) {
                if (empty($data['cmnd']) && $user->cmnd) {
                    $data['cmnd'] = $user->cmnd;
                }

                if (empty($data['birthday']) && $user->birth_year) {
                    $data['birthday'] = sprintf('%d-01-01', $user->birth_year);
                }
            }
        }

        if (array_key_exists('source', $data)) {
            if ($data['source'] === '' || $data['source'] === null) {
                $data['source'] = $existing?->source ?? StudentSource::Manual;
            } else {
                $data['source'] = StudentSource::from($data['source']);
            }
        } elseif ($existing === null) {
            $data['source'] = StudentSource::Manual;
        }

        $data['type'] = $data['type'] ?? ($existing?->type ?? 'X');

        return $data;
    }

    /**
     * @return array<string, mixed>
     */
    private function toListArray(Student $student): array
    {
        return [
            'id' => $student->id,
            'name' => $student->name,
            'student_code' => $student->student_code,
            'cmnd' => $student->cmnd,
            'course' => $student->course,
            'class_name' => $student->class_name,
            'graduation_date' => $student->graduation_date?->format('Y-m-d'),
            'source' => $student->source?->value,
            'is_revoked' => $student->is_revoked,
            'created_at' => $student->created_at?->toIso8601String(),
            'user' => $student->user ? [
                'id' => $student->user->id,
                'name' => $student->user->name,
                'email' => $student->user->email,
            ] : null,
        ];
    }
}
