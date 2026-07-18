<?php

use App\Models\Chapter;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\User;

test('admin can update chapter and lesson without replacing video', function () {
    $admin = User::factory()->admin()->create();

    $course = Course::create([
        'title' => 'Khóa cập nhật chương trình',
        'slug' => 'khoa-cap-nhat-chuong-trinh',
        'description' => 'Test',
        'price' => 100_000,
    ]);

    $chapter = Chapter::create([
        'course_id' => $course->id,
        'title' => 'Chương cũ',
        'sort_order' => 0,
        'is_published' => true,
    ]);

    $lesson = Lesson::create([
        'chapter_id' => $chapter->id,
        'title' => 'Bài cũ',
        'sort_order' => 0,
        'video_s3_key' => 'lessons/existing.mp4',
        'duration_seconds' => 600,
        'is_free_preview' => false,
        'is_published' => true,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.chapters.update', $chapter), [
            'title' => 'Chương mới',
            'is_published' => false,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $chapter->refresh();
    expect($chapter->title)->toBe('Chương mới')
        ->and($chapter->is_published)->toBeFalse();

    $this->actingAs($admin)
        ->patch(route('admin.lessons.update', $lesson), [
            'title' => 'Bài mới',
            'duration_seconds' => 900,
            'is_free_preview' => true,
            'is_published' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $lesson->refresh();
    expect($lesson->title)->toBe('Bài mới')
        ->and($lesson->duration_seconds)->toBe(900)
        ->and($lesson->is_free_preview)->toBeTrue()
        ->and($lesson->video_s3_key)->toBe('lessons/existing.mp4');
});
