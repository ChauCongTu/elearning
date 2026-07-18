<?php

use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Chapter;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\User;
use Illuminate\Support\Facades\Storage;

/**
 * @return array{course: Course, chapter: Chapter, lesson: Lesson, previewLesson: Lesson}
 */
function createLearningFixtures(bool $withPreview = false): array
{
    $category = Category::create([
        'name' => 'Phun xăm',
        'slug' => 'phun-xam-learning',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa học Online',
        'slug' => 'khoa-hoc-online',
        'price' => 1_000_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    $chapter = Chapter::create([
        'course_id' => $course->id,
        'title' => 'Chương 1',
        'sort_order' => 0,
        'is_published' => true,
    ]);

    $lesson = Lesson::create([
        'chapter_id' => $chapter->id,
        'title' => 'Bài 1',
        'sort_order' => $withPreview ? 1 : 0,
        'video_s3_key' => 'lessons/videos/sample.mp4',
        'duration_seconds' => 100,
        'is_free_preview' => false,
        'is_published' => true,
    ]);

    $previewLesson = Lesson::create([
        'chapter_id' => $chapter->id,
        'title' => 'Bài preview',
        'sort_order' => $withPreview ? 0 : 1,
        'video_s3_key' => 'lessons/videos/preview.mp4',
        'duration_seconds' => 60,
        'is_free_preview' => $withPreview,
        'is_published' => true,
    ]);

    return compact('course', 'chapter', 'lesson', 'previewLesson');
}

beforeEach(function () {
    Storage::fake('s3');
    config(['video.disk' => 's3']);

    Storage::disk('s3')->put('lessons/videos/sample.mp4', 'video-content');
    Storage::disk('s3')->put('lessons/videos/preview.mp4', 'preview-content');
});

test('user without enrollment cannot access paid lesson', function () {
    ['course' => $course, 'lesson' => $lesson] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    $this->actingAs($user)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $lesson,
        ]))
        ->assertForbidden();
});

test('enrolled student receives signed video url on player page', function () {
    ['course' => $course, 'lesson' => $lesson] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    $this->actingAs($user)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $lesson,
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('learn/player')
            ->where('currentLesson.id', $lesson->id)
            ->where('canTrackProgress', true)
            ->has('videoUrl'));
});

test('progress update increases watched seconds', function () {
    ['course' => $course, 'lesson' => $lesson] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    $this->actingAs($user)
        ->patchJson(route('learn.progress.update'), [
            'lesson_id' => $lesson->id,
            'watched_seconds' => 30,
        ])
        ->assertOk();

    $this->actingAs($user)
        ->patchJson(route('learn.progress.update'), [
            'lesson_id' => $lesson->id,
            'watched_seconds' => 42,
        ])
        ->assertOk()
        ->assertJson([
            'watched_seconds' => 42,
            'completed' => false,
        ]);

    $this->assertDatabaseHas('lesson_progress', [
        'lesson_id' => $lesson->id,
        'watched_seconds' => 42,
        'completed' => false,
    ]);
});

test('watching ninety percent marks lesson completed and updates enrollment progress', function () {
    ['course' => $course, 'lesson' => $lesson] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    $this->actingAs($user)
        ->patchJson(route('learn.progress.update'), [
            'lesson_id' => $lesson->id,
            'watched_seconds' => 35,
        ])
        ->assertOk();

    $this->actingAs($user)
        ->patchJson(route('learn.progress.update'), [
            'lesson_id' => $lesson->id,
            'watched_seconds' => 70,
        ])
        ->assertOk();

    $this->actingAs($user)
        ->patchJson(route('learn.progress.update'), [
            'lesson_id' => $lesson->id,
            'watched_seconds' => 90,
        ])
        ->assertOk()
        ->assertJson([
            'watched_seconds' => 90,
            'completed' => true,
            'progress_percent' => '50.00',
        ]);

    expect($enrollment->fresh()->progress_percent)->toBe('50.00');
});

test('preview lesson is accessible without enrollment', function () {
    ['course' => $course, 'previewLesson' => $previewLesson] = createLearningFixtures(withPreview: true);

    $this->get(route('learn.lessons.show', [
        'course' => $course->slug,
        'lesson' => $previewLesson,
    ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('learn/player')
            ->where('currentLesson.id', $previewLesson->id)
            ->where('canTrackProgress', false)
            ->has('videoUrl'));
});

test('learn redirect sends student to resume lesson', function () {
    ['course' => $course, 'lesson' => $lesson] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    $this->actingAs($user)
        ->get(route('learn.show', ['course' => $course->slug]))
        ->assertRedirect(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $lesson,
        ]));
});

test('progress update cannot jump forward more than allowed seconds', function () {
    ['course' => $course, 'lesson' => $lesson] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    $this->actingAs($user)
        ->patchJson(route('learn.progress.update'), [
            'lesson_id' => $lesson->id,
            'watched_seconds' => 20,
        ])
        ->assertOk()
        ->assertJson(['watched_seconds' => 20]);

    $this->actingAs($user)
        ->patchJson(route('learn.progress.update'), [
            'lesson_id' => $lesson->id,
            'watched_seconds' => 500,
        ])
        ->assertOk()
        ->assertJson(['watched_seconds' => 55]);
});

test('enrolled student cannot access next lesson until previous reaches eighty percent', function () {
    ['course' => $course, 'lesson' => $lesson, 'previewLesson' => $nextLesson] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    $this->actingAs($user)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $nextLesson,
        ]))
        ->assertForbidden();
});

test('enrolled student can access next lesson after watching eighty percent of previous', function () {
    ['course' => $course, 'lesson' => $lesson, 'previewLesson' => $nextLesson] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    $enrollment = Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    \App\Models\LessonProgress::create([
        'enrollment_id' => $enrollment->id,
        'lesson_id' => $lesson->id,
        'watched_seconds' => 80,
        'completed' => false,
        'last_watched_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $nextLesson,
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('learn/player')
            ->where('currentLesson.id', $nextLesson->id));
});

test('account courses page links to learn route', function () {
    ['course' => $course] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    $this->actingAs($user)
        ->get(route('account.courses'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('account/courses'));
});
