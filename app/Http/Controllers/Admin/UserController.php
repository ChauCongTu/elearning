<?php

namespace App\Http\Controllers\Admin;

use App\Concerns\AdminStudentValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Contracts\Admin\AdminCourseServiceInterface;
use App\Contracts\Admin\AdminStudentServiceInterface;
use App\Contracts\Admin\AdminUserServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use AdminStudentValidationRules, ProfileValidationRules;

    public function __construct(
        private AdminUserServiceInterface $users,
        private AdminCourseServiceInterface $courses,
        private AdminStudentServiceInterface $students,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => $this->users->paginateForAdmin($request->only(['search', 'role'])),
            'filters' => $request->only(['search', 'role']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            ...$this->profileRules(),
            'must_change_password' => ['nullable', 'boolean'],
            'role' => ['required', 'in:student,admin'],
            'can_complete_orders' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'Vui lòng nhập họ tên.',
            'email.required' => 'Vui lòng nhập email.',
            'email.unique' => 'Email đã được sử dụng.',
        ]);

        $result = $this->users->create([
            ...$data,
            'can_complete_orders' => $request->boolean('can_complete_orders'),
            'must_change_password' => $request->boolean('must_change_password', true),
        ], $request->user());

        $redirect = redirect()
            ->route('admin.users.show', $result['user'])
            ->with('success', 'Đã tạo người dùng mới.');

        if ($result['generated_password'] !== null) {
            $redirect->with('generated_password', $result['generated_password']);
        }

        return $redirect;
    }

    public function show(User $user): Response
    {
        return Inertia::render('admin/users/show', [
            'user' => $this->users->show($user),
            'courses' => Course::query()
                ->orderBy('title')
                ->get(['id', 'title'])
                ->map(fn (Course $c) => ['id' => $c->id, 'title' => $c->title])
                ->all(),
            'formOptions' => $this->students->formOptions(),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'role' => ['required', 'in:student,admin'],
            'can_complete_orders' => ['nullable', 'boolean'],
        ]);

        $this->users->updateRole($user, $data['role'], $request->user());

        if ($user->fresh()->isAdmin() && $request->has('can_complete_orders')) {
            $this->users->updateOrderCompletionPermission($user, $request->boolean('can_complete_orders'), $request->user());
        }

        return back()->with('success', 'Đã cập nhật người dùng.');
    }

    public function grantEnrollment(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'course_id' => ['required', 'uuid', 'exists:courses,id'],
        ]);

        $course = Course::findOrFail($data['course_id']);
        $this->users->grantEnrollment($user, $course, $request->user());

        return back()->with('success', 'Đã cấp quyền học thủ công.');
    }

    public function storeStudent(Request $request, User $user): RedirectResponse
    {
        $data = $this->validateAdminStudent($request);
        $data['user_id'] = $user->id;

        $this->students->create($data);

        return back()->with('success', 'Đã thêm hồ sơ tra cứu cho người dùng.');
    }

    public function updateStudent(Request $request, User $user, Student $student): RedirectResponse
    {
        $data = $this->validateAdminStudent($request, $student->id);
        $data['user_id'] = $user->id;

        $this->students->update($student, $data);

        return back()->with('success', 'Đã cập nhật hồ sơ tra cứu.');
    }
}
