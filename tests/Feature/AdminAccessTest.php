<?php

use App\Enums\UserRole;
use App\Models\User;

test('students cannot access admin dashboard', function () {
    $student = User::factory()->create([
        'role' => UserRole::Student,
    ]);

    $this->actingAs($student)
        ->get(route('admin.dashboard'))
        ->assertForbidden();
});

test('admins can access admin dashboard', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk();
});

test('guests are redirected from admin dashboard', function () {
    $this->get(route('admin.dashboard'))
        ->assertRedirect(route('login'));
});

test('public courses page is accessible without auth', function () {
    $this->get(route('courses.index'))
        ->assertOk();
});
