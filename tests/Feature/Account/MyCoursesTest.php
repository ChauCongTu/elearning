<?php

use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;

test('guest is redirected from my courses', function () {
    $this->get(route('account.courses'))
        ->assertRedirect(route('login'));
});

test('unverified user is redirected from my courses', function () {
    $user = User::factory()->unverified()->create([
        'role' => UserRole::Student,
    ]);

    $this->actingAs($user)
        ->get(route('account.courses'))
        ->assertRedirect(route('verification.notice'));
});

test('verified student can view my courses page', function () {
    $user = User::factory()->create([
        'role' => UserRole::Student,
    ]);

    $category = Category::create([
        'name' => 'Phun xăm',
        'slug' => 'phun-xam',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $courses = collect([
        ['title' => 'Khóa A', 'slug' => 'khoa-a', 'progress' => 35],
        ['title' => 'Khóa B', 'slug' => 'khoa-b', 'progress' => 0],
    ])->map(function (array $data) use ($category) {
        return Course::create([
            'category_id' => $category->id,
            'title' => $data['title'],
            'slug' => $data['slug'],
            'price' => 1_000_000,
            'is_published' => true,
            'published_at' => now(),
        ]);
    });

    foreach ($courses as $index => $course) {
        Enrollment::create([
            'user_id' => $user->id,
            'course_id' => $course->id,
            'status' => EnrollmentStatus::Active,
            'progress_percent' => $index === 0 ? 35 : 0,
            'enrolled_at' => now()->subDays($index),
            'source' => EnrollmentSource::Manual,
        ]);
    }

    $this->actingAs($user)
        ->get(route('account.courses'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('account/courses')
            ->has('enrollments', 2)
            ->where('enrollments.0.progress_percent', '35.00'));
});

test('verified student with no enrollments sees empty list', function () {
    $user = User::factory()->create([
        'role' => UserRole::Student,
    ]);

    $this->actingAs($user)
        ->get(route('account.courses'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('account/courses')
            ->has('enrollments', 0));
});
