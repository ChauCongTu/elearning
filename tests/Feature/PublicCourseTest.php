<?php

use App\Models\Category;
use App\Models\Chapter;
use App\Models\Course;
use App\Models\Lesson;

test('home page renders published courses', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/home')
            ->has('enrollmentCourses')
            ->has('siteContent')
            ->has('featuredCourses')
            ->has('articleSections'));
});

test('courses index returns published courses only', function () {
    $category = Category::create([
        'name' => 'Hidden',
        'slug' => 'hidden',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    Course::create([
        'category_id' => $category->id,
        'title' => 'Draft Course',
        'slug' => 'draft-course',
        'price' => 1_000_000,
        'is_published' => false,
    ]);

    $this->get(route('courses.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/courses/index')
            ->has('courses')
            ->where('courses', fn ($courses) => collect($courses)->every(
                fn ($course) => $course['slug'] !== 'draft-course'
            )));
});

test('courses can be searched by title', function () {
    $category = Category::create([
        'name' => 'Test',
        'slug' => 'test',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa Phun Môi Chuyên Sâu',
        'slug' => 'khoa-phun-moi',
        'price' => 1_000_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa Nối Mi Cơ Bản',
        'slug' => 'khoa-noi-mi',
        'price' => 2_000_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $this->get(route('courses.index', ['q' => 'Phun Môi']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('courses', fn ($courses) => count($courses) === 1)
            ->where('courses.0.slug', 'khoa-phun-moi'));
});

test('unpublished course returns 404 on detail page', function () {
    $category = Category::create([
        'name' => 'Test',
        'slug' => 'test-cat',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    Course::create([
        'category_id' => $category->id,
        'title' => 'Draft',
        'slug' => 'draft-only',
        'price' => 1_000_000,
        'is_published' => false,
    ]);

    $this->get(route('courses.show', 'draft-only'))
        ->assertNotFound();
});

test('consultation request can be submitted', function () {
    $this->post(route('consultation.store'), [
        'name' => 'Nguyễn Văn A',
        'phone' => '0912345678',
        'course_interest' => 'Phun xăm thẩm mỹ cơ bản',
        'branch' => '281/2/10 Bình Lợi, P.13, Q. Bình Thạnh, TP.HCM',
    ])->assertRedirect();

    $this->assertDatabaseHas('consultation_requests', [
        'name' => 'Nguyễn Văn A',
        'phone' => '0912345678',
    ]);
});

test('published course detail page renders curriculum', function () {
    $category = Category::create([
        'name' => 'Chăm sóc da',
        'slug' => 'cham-soc-da',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa Học Chăm Sóc Da Cơ Bản',
        'slug' => 'khoa-hoc-cham-soc-da-co-ban',
        'price' => 6_000_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $chapter = Chapter::create([
        'course_id' => $course->id,
        'title' => 'Chương 1',
        'sort_order' => 0,
        'is_published' => true,
    ]);

    Lesson::create([
        'chapter_id' => $chapter->id,
        'title' => 'Bài 1',
        'sort_order' => 0,
        'duration_seconds' => 600,
        'is_published' => true,
    ]);

    $this->get(route('courses.show', 'khoa-hoc-cham-soc-da-co-ban'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/courses/show')
            ->has('course.chapters.0.lessons'));
});
