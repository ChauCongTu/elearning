<?php

use App\Models\Post;
use App\Models\PostCategory;
use Database\Seeders\PostSeeder;

beforeEach(function () {
    $this->seed(PostSeeder::class);
});

test('posts index renders published posts', function () {
    $this->get(route('posts.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/posts/index')
            ->has('posts.data')
            ->has('categories'));
});

test('post detail page renders by slug', function () {
    $this->get(route('posts.show', 'phu-nu-nen-hoc-nghe-gi'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/posts/show')
            ->where('post.slug', 'phu-nu-nen-hoc-nghe-gi')
            ->has('relatedPosts'));
});

test('post category page renders', function () {
    $this->get(route('posts.category', 'huong-nghiep'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/posts/index')
            ->where('activeCategory.slug', 'huong-nghiep'));
});

test('home page includes article sections from database', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('articleSections')
            ->where('articleSections.1.key', 'career'));
});

test('unpublished post returns 404', function () {
    $category = PostCategory::create([
        'name' => 'Test',
        'slug' => 'test-post-cat',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    Post::create([
        'post_category_id' => $category->id,
        'title' => 'Draft Post',
        'slug' => 'draft-post-only',
        'content' => 'Hidden',
        'is_published' => false,
    ]);

    $this->get(route('posts.show', 'draft-post-only'))
        ->assertNotFound();
});
