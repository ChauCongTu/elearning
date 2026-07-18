<?php

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('admin post update preserves featured image without re-upload', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $post = Post::create([
        'title' => 'Bài viết gốc',
        'slug' => 'bai-viet-goc',
        'content' => 'Nội dung gốc',
        'featured_image' => 'posts/existing.jpg',
        'user_id' => $admin->id,
        'author_name' => $admin->name,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.posts.update', $post), [
            'title' => 'Bài viết đã sửa',
            'content' => 'Nội dung mới',
            'is_published' => true,
            'is_featured' => false,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $post->refresh();

    expect($post->title)->toBe('Bài viết đã sửa')
        ->and($post->featured_image)->toBe('posts/existing.jpg');
});

test('admin course update preserves thumbnail and faq without re-upload', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $course = \App\Models\Course::create([
        'title' => 'Khóa học FAQ',
        'slug' => 'khoa-hoc-faq',
        'description' => 'Mô tả',
        'price' => 500_000,
        'thumbnail_path' => 'courses/existing.jpg',
        'faq' => [
            ['q' => 'Câu cũ?', 'a' => 'Trả lời cũ'],
        ],
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.courses.update', $course), [
            'title' => 'Khóa học FAQ cập nhật',
            'description' => 'Mô tả mới',
            'price' => 600_000,
            'faq' => [
                ['q' => 'Học bao lâu?', 'a' => 'Khoảng 3 tháng'],
            ],
            'is_published' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $course->refresh();

    expect($course->title)->toBe('Khóa học FAQ cập nhật')
        ->and($course->thumbnail_path)->toBe('courses/existing.jpg')
        ->and($course->faq)->toBe([
            ['q' => 'Học bao lâu?', 'a' => 'Khoảng 3 tháng'],
        ]);
});

test('admin can upload new post featured image on update', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $post = Post::create([
        'title' => 'Bài có ảnh',
        'slug' => 'bai-co-anh',
        'content' => 'Nội dung',
        'featured_image' => 'posts/old.jpg',
        'user_id' => $admin->id,
        'author_name' => $admin->name,
    ]);

    $this->actingAs($admin)
        ->patch(route('admin.posts.update', $post), [
            'title' => 'Bài có ảnh',
            'content' => 'Nội dung',
            'featured_image' => UploadedFile::fake()->image('new.jpg'),
            'is_published' => true,
        ])
        ->assertRedirect();

    $post->refresh();

    expect($post->featured_image)->not->toBe('posts/old.jpg')
        ->and($post->featured_image)->not->toBeNull();
});
