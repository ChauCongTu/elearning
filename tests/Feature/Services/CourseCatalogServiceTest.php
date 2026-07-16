<?php

use App\Models\Category;
use App\Models\Course;
use App\Services\Catalog\CourseCatalogService;
use Illuminate\Database\Eloquent\ModelNotFoundException;

test('course catalog filters by title search', function () {
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

    $service = new CourseCatalogService;
    $results = $service->listForCatalog(['q' => 'Phun Môi']);

    expect($results)->toHaveCount(1)
        ->and($results->first()->slug)->toBe('khoa-phun-moi');
});

test('course catalog excludes unpublished courses from detail lookup', function () {
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

    $service = new CourseCatalogService;

    expect(fn () => $service->findPublishedBySlug('draft-only'))
        ->toThrow(ModelNotFoundException::class);
});
