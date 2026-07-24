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

/**
 * @return array{course: Course, chapter: Chapter, lessons: array<int, Lesson>}
 */
function createSequentialLessonFixtures(int $lessonCount = 4): array
{
    $category = Category::create([
        'name' => 'Phun xăm',
        'slug' => 'phun-xam-seq-'.uniqid(),
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa học tuần tự',
        'slug' => 'khoa-hoc-tuan-tu-'.uniqid(),
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

    $lessons = [];

    for ($index = 0; $index < $lessonCount; $index++) {
        $videoKey = "lessons/videos/lesson-{$index}.mp4";
        Storage::disk('s3')->put($videoKey, 'video-content');

        $lessons[] = Lesson::create([
            'chapter_id' => $chapter->id,
            'title' => 'Bài '.($index + 1),
            'sort_order' => $index,
            'video_s3_key' => $videoKey,
            'duration_seconds' => 100,
            'is_free_preview' => false,
            'is_published' => true,
        ]);
    }

    return compact('course', 'chapter', 'lessons');
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
            ->where('watermark.enabled', true)
            ->where('watermark.label', $user->name.' - '.$user->email)
            ->where('capture_guard.enabled', true)
            ->where('videoStreamUrl', fn (string $url) => str_contains($url, '/learn/lessons/')
                && ! str_contains($url, 'amazonaws.com')
                && ! str_contains($url, 'X-Amz-'))
            ->has('videoStreamUrl'));
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
            ->where('watermark.enabled', false)
            ->has('videoStreamUrl'));
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

test('mark as done requires at least eighty percent watch time', function () {
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
        ->postJson(route('learn.progress.complete', ['lesson' => $lesson]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('lesson');
});

test('mark as done unlocks next lesson after eighty percent watch', function () {
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
        ->postJson(route('learn.progress.complete', ['lesson' => $lesson]))
        ->assertOk()
        ->assertJson([
            'watched_seconds' => 90,
            'completed' => true,
        ]);

    $this->actingAs($user)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $nextLesson,
        ]))
        ->assertOk();
});

test('one student progress does not unlock lessons for another student', function () {
    ['course' => $course, 'lessons' => $lessons] = createSequentialLessonFixtures(3);

    $studentA = User::factory()->create(['role' => UserRole::Student]);
    $studentB = User::factory()->create(['role' => UserRole::Student]);

    $enrollmentA = Enrollment::create([
        'user_id' => $studentA->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    Enrollment::create([
        'user_id' => $studentB->id,
        'course_id' => $course->id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    \App\Models\LessonProgress::create([
        'enrollment_id' => $enrollmentA->id,
        'lesson_id' => $lessons[0]->id,
        'watched_seconds' => 100,
        'completed' => true,
        'last_watched_at' => now(),
    ]);

    $this->actingAs($studentA)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $lessons[1],
        ]))
        ->assertOk();

    $this->actingAs($studentB)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $lessons[1],
        ]))
        ->assertForbidden();
});

test('zero duration lesson does not unlock next lesson from minimal watch', function () {
    $category = \App\Models\Category::create([
        'name' => 'Phun xăm',
        'slug' => 'phun-xam-zero-duration',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa zero duration',
        'slug' => 'khoa-zero-duration',
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

    $first = Lesson::create([
        'chapter_id' => $chapter->id,
        'title' => 'Bài không duration',
        'sort_order' => 0,
        'video_s3_key' => 'lessons/videos/no-duration.mp4',
        'duration_seconds' => 0,
        'is_free_preview' => false,
        'is_published' => true,
    ]);

    $second = Lesson::create([
        'chapter_id' => $chapter->id,
        'title' => 'Bài kế tiếp',
        'sort_order' => 1,
        'video_s3_key' => 'lessons/videos/next.mp4',
        'duration_seconds' => 100,
        'is_free_preview' => false,
        'is_published' => true,
    ]);

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
        'lesson_id' => $first->id,
        'watched_seconds' => 5,
        'completed' => false,
        'last_watched_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $second,
        ]))
        ->assertForbidden();
});

test('user without enrollment cannot mark lesson as done', function () {
    ['lesson' => $lesson] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    $this->actingAs($user)
        ->postJson(route('learn.progress.complete', ['lesson' => $lesson]))
        ->assertForbidden();
});

test('enrolled student cannot skip unfinished earlier lessons', function () {
    ['course' => $course, 'lessons' => $lessons] = createSequentialLessonFixtures();

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
        'lesson_id' => $lessons[0]->id,
        'watched_seconds' => 100,
        'completed' => true,
        'last_watched_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $lessons[1],
        ]))
        ->assertOk();

    $this->actingAs($user)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $lessons[2],
        ]))
        ->assertForbidden();

    $this->actingAs($user)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $lessons[3],
        ]))
        ->assertForbidden();
});

test('resume redirects to first incomplete lesson not last watched lesson', function () {
    ['course' => $course, 'lessons' => $lessons] = createSequentialLessonFixtures();

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
        'lesson_id' => $lessons[0]->id,
        'watched_seconds' => 100,
        'completed' => true,
        'last_watched_at' => now()->subHour(),
    ]);

    \App\Models\LessonProgress::create([
        'enrollment_id' => $enrollment->id,
        'lesson_id' => $lessons[3]->id,
        'watched_seconds' => 10,
        'completed' => false,
        'last_watched_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('learn.show', ['course' => $course->slug]))
        ->assertRedirect(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $lessons[1],
        ]));
});

test('player navigation next points to immediate next lesson only', function () {
    ['course' => $course, 'lessons' => $lessons] = createSequentialLessonFixtures();

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
        'lesson_id' => $lessons[0]->id,
        'watched_seconds' => 100,
        'completed' => true,
        'last_watched_at' => now(),
    ]);

    $this->actingAs($user)
        ->get(route('learn.lessons.show', [
            'course' => $course->slug,
            'lesson' => $lessons[0],
        ]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('learn/player')
            ->where('navigation.next.id', $lessons[1]->id));
});

test('enrolled student can stream lesson video through proxy endpoint', function () {
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
        ->withHeader('Sec-Fetch-Dest', 'video')
        ->get(route('learn.lessons.stream', ['lesson' => $lesson]))
        ->assertOk()
        ->assertHeader('Content-Disposition', 'inline; filename="lesson.bin"');
});

test('lesson stream cannot be opened directly in browser tab', function () {
    ['lesson' => $lesson] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    Enrollment::create([
        'user_id' => $user->id,
        'course_id' => $lesson->chapter->course_id,
        'status' => EnrollmentStatus::Active,
        'progress_percent' => 0,
        'enrolled_at' => now(),
        'source' => EnrollmentSource::Manual,
    ]);

    $this->actingAs($user)
        ->withHeader('Sec-Fetch-Dest', 'document')
        ->withHeader('Sec-Fetch-Mode', 'navigate')
        ->get(route('learn.lessons.stream', ['lesson' => $lesson]))
        ->assertForbidden();
});

test('user without enrollment cannot stream paid lesson video', function () {
    ['lesson' => $lesson] = createLearningFixtures();

    $user = User::factory()->create(['role' => UserRole::Student]);

    $this->actingAs($user)
        ->withHeader('Sec-Fetch-Dest', 'video')
        ->get(route('learn.lessons.stream', ['lesson' => $lesson]))
        ->assertForbidden();
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
