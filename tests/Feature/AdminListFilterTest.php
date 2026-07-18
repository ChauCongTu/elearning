<?php

use App\Models\Course;
use App\Models\Post;
use App\Models\PostCategory;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('admin course list filters by publish status', function () {
    $admin = User::factory()->admin()->create();

    Course::create([
        'title' => 'Published course',
        'slug' => 'published-course',
        'description' => 'Test',
        'price' => 100_000,
        'is_published' => true,
    ]);
    Course::create([
        'title' => 'Draft course',
        'slug' => 'draft-course',
        'description' => 'Test',
        'price' => 100_000,
        'is_published' => false,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.courses.index', ['is_published' => '1']))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/courses/index')
            ->where('filters.is_published', '1')
            ->has('courses.data', 1)
            ->where('courses.data.0.title', 'Published course'));
});

test('admin post list filters by category', function () {
    $admin = User::factory()->admin()->create();

    $categoryA = PostCategory::create([
        'name' => 'Category A',
        'slug' => 'category-a',
        'sort_order' => 0,
        'is_active' => true,
    ]);
    $categoryB = PostCategory::create([
        'name' => 'Category B',
        'slug' => 'category-b',
        'sort_order' => 1,
        'is_active' => true,
    ]);

    Post::create([
        'title' => 'Post A',
        'slug' => 'post-a',
        'content' => 'Content A',
        'post_category_id' => $categoryA->id,
        'user_id' => $admin->id,
        'author_name' => $admin->name,
    ]);
    Post::create([
        'title' => 'Post B',
        'slug' => 'post-b',
        'content' => 'Content B',
        'post_category_id' => $categoryB->id,
        'user_id' => $admin->id,
        'author_name' => $admin->name,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.posts.index', ['post_category_id' => $categoryA->id]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/posts/index')
            ->where('filters.post_category_id', $categoryA->id)
            ->has('posts.data', 1)
            ->where('posts.data.0.title', 'Post A'));
});

test('admin can create banner with image upload', function () {
    Storage::fake('public');
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.banners.store'), [
            'title' => 'Banner test',
            'link_url' => '',
            'sort_order' => 0,
            'is_active' => true,
            'starts_at' => '',
            'ends_at' => '',
            'image' => UploadedFile::fake()->image('banner.jpg', 1920, 720),
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('banners', [
        'title' => 'Banner test',
        'is_active' => true,
    ]);
});
