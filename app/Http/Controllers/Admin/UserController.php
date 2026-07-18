<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Admin\AdminCourseServiceInterface;
use App\Contracts\Admin\AdminUserServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        private AdminUserServiceInterface $users,
        private AdminCourseServiceInterface $courses,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => $this->users->paginateForAdmin($request->only(['search', 'role'])),
            'filters' => $request->only(['search', 'role']),
        ]);
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
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'role' => ['required', 'in:student,admin'],
        ]);

        $this->users->updateRole($user, $data['role'], $request->user());

        return back()->with('success', 'Đã cập nhật vai trò.');
    }

    public function grantEnrollment(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'course_id' => ['required', 'uuid', 'exists:courses,id'],
        ]);

        $course = Course::findOrFail($data['course_id']);
        $this->users->grantEnrollment($user, $course);

        return back()->with('success', 'Đã cấp quyền học thủ công.');
    }
}
