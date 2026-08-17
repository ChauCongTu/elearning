<?php

use App\Models\Category;
use App\Models\Course;
use App\Models\Post;
use App\Models\PostCategory;

test('sitemap returns xml with static and published content urls', function () {
    $category = Category::create([
        'name' => 'Test',
        'slug' => 'test',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    Course::create([
        'category_id' => $category->id,
        'title' => 'Published Course',
        'slug' => 'published-course',
        'price' => 1_000_000,
        'is_published' => true,
        'published_at' => now(),
    ]);

    Course::create([
        'category_id' => $category->id,
        'title' => 'Draft Course',
        'slug' => 'draft-course',
        'price' => 1_000_000,
        'is_published' => false,
    ]);

    $postCategory = PostCategory::create([
        'name' => 'Tin mới',
        'slug' => 'tin-moi',
        'sort_order' => 0,
        'is_active' => true,
    ]);

    Post::create([
        'post_category_id' => $postCategory->id,
        'title' => 'Published Post',
        'slug' => 'published-post',
        'content' => 'Body',
        'is_published' => true,
        'published_at' => now(),
    ]);

    $response = $this->get(route('seo.sitemap'));

    $response
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

    $content = $response->getContent();

    expect($content)->toContain('<urlset');
    expect($content)->toContain(route('home'));
    expect($content)->toContain(route('courses.index'));
    expect($content)->toContain(route('courses.show', 'published-course'));
    expect($content)->toContain(route('posts.index'));
    expect($content)->toContain(route('posts.category', 'tin-moi'));
    expect($content)->toContain(route('posts.show', 'published-post'));
    expect($content)->not->toContain('draft-course');
});

test('robots.txt references sitemap with app url', function () {
    config(['app.url' => 'https://example.test']);

    $this->get(route('seo.robots'))
        ->assertOk()
        ->assertHeader('Content-Type', 'text/plain; charset=UTF-8')
        ->assertSee('User-agent: *')
        ->assertSee('Sitemap: https://example.test/sitemap.xml');
});

test('sitemap and robots are available during maintenance mode', function () {
    config(['site.maintenance.enabled' => true]);

    $this->get(route('seo.sitemap'))->assertOk();
    $this->get(route('seo.robots'))->assertOk();
});
