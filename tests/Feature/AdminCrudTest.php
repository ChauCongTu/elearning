<?php

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Course;
use App\Models\User;

test('admin can create category', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.categories.store'), [
            'name' => 'Danh mục test',
            'sort_order' => 1,
            'is_active' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('categories', [
        'name' => 'Danh mục test',
        'slug' => 'danh-muc-test',
    ]);
});

test('admin can create course', function () {
    $admin = User::factory()->admin()->create();
    $category = Category::create([
        'name' => 'Test Cat',
        'slug' => 'test-cat',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $this->actingAs($admin)
        ->post(route('admin.courses.store'), [
            'category_id' => $category->id,
            'title' => 'Khóa học test',
            'description' => 'Mô tả khóa học',
            'price' => 1_000_000,
            'is_published' => true,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('courses', [
        'title' => 'Khóa học test',
        'slug' => 'khoa-hoc-test',
        'is_published' => true,
    ]);
});

test('admin manual enrollment creates record', function () {
    $admin = User::factory()->create([
        'role' => UserRole::Admin,
        'can_complete_orders' => true,
    ]);
    $student = User::factory()->create(['role' => UserRole::Student]);
    $course = Course::create([
        'title' => 'Khóa cấp quyền',
        'slug' => 'khoa-cap-quyen',
        'description' => 'Test',
        'price' => 500_000,
        'is_published' => true,
    ]);

    $this->actingAs($admin)
        ->post(route('admin.users.enrollments.store', $student), [
            'course_id' => $course->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('enrollments', [
        'user_id' => $student->id,
        'course_id' => $course->id,
        'source' => 'manual',
        'status' => 'active',
    ]);
});

test('admin cannot demote own role', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->patch(route('admin.users.update', $admin), [
            'role' => 'student',
        ])
        ->assertSessionHasErrors('role');
});

test('student cannot access admin categories', function () {
    $student = User::factory()->create(['role' => UserRole::Student]);

    $this->actingAs($student)
        ->get(route('admin.categories.index'))
        ->assertRedirect(route('account.courses'));
});

test('admin can create user', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'Học viên mới',
            'email' => 'new-student@example.com',
            'phone' => '0901234567',
            'must_change_password' => true,
            'role' => 'student',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('generated_password');

    $this->assertDatabaseHas('users', [
        'name' => 'Học viên mới',
        'email' => 'new-student@example.com',
        'role' => UserRole::Student->value,
        'must_change_password' => true,
    ]);
});

test('admin create user always generates password', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)
        ->post(route('admin.users.store'), [
            'name' => 'User auto pass',
            'email' => 'auto-pass@example.com',
            'must_change_password' => true,
            'role' => 'student',
        ]);

    $response->assertRedirect();
    $response->assertSessionHas('generated_password');

    expect(User::query()->where('email', 'auto-pass@example.com')->value('must_change_password'))->toBeTrue();
});

test('user with must change password is redirected after login', function () {
    $user = User::factory()->create([
        'role' => UserRole::Student,
        'must_change_password' => true,
        'password' => 'Password1!',
    ]);

    $this->post(route('login'), [
        'email' => $user->email,
        'password' => 'Password1!',
    ])->assertRedirect(route('password.required'));
});
