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
    $admin = User::factory()->admin()->create();
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
