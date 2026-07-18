<?php

use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;

test('published course detail includes review props', function () {
    $category = Category::create([
        'name' => 'Chăm sóc da',
        'slug' => 'cham-soc-da',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa Review',
        'slug' => 'khoa-review',
        'price' => 1_000_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $this->get(route('courses.show', 'khoa-review'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/courses/show')
            ->has('reviewSummary')
            ->has('reviews')
            ->where('canReview', false));
});

test('enrolled student can submit a course review', function () {
    $user = User::factory()->create(['role' => UserRole::Student]);

    $category = Category::create([
        'name' => 'Phun xăm',
        'slug' => 'phun-xam',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa A',
        'slug' => 'khoa-a',
        'price' => 1_000_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 10,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    $this->actingAs($user)
        ->post(route('account.courses.reviews.store', 'khoa-a'), [
            'rating' => 5,
            'body' => 'Khóa học rất hữu ích!',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('course_reviews', [
        'user_id' => $user->id,
        'course_id' => $course->id,
        'rating' => 5,
        'body' => 'Khóa học rất hữu ích!',
        'is_published' => true,
    ]);
});

test('non-enrolled student cannot submit review', function () {
    $user = User::factory()->create(['role' => UserRole::Student]);

    $category = Category::create([
        'name' => 'Phun xăm',
        'slug' => 'phun-xam-2',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa B',
        'slug' => 'khoa-b',
        'price' => 1_000_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $this->actingAs($user)
        ->post(route('account.courses.reviews.store', 'khoa-b'), [
            'rating' => 4,
        ])
        ->assertForbidden();
});

test('admin can access reviews moderation page', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('admin.reviews.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/reviews/index'));
});
