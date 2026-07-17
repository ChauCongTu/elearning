<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'category_id',
    'title',
    'slug',
    'excerpt',
    'description',
    'price',
    'compare_price',
    'thumbnail_path',
    'instructor_name',
    'instructor_title',
    'duration_label',
    'lesson_count_label',
    'benefits',
    'faq',
    'is_featured',
    'is_published',
    'legacy_product_id',
    'meta',
    'published_at',
])]
class Course extends BaseModel
{
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'course_category');
    }

    public function chapters(): HasMany
    {
        return $this->hasMany(Chapter::class)->orderBy('sort_order');
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function publishedChapters(): HasMany
    {
        return $this->chapters()->where('is_published', true);
    }

    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    protected function casts(): array
    {
        return [
            'price' => 'decimal:0',
            'compare_price' => 'decimal:0',
            'benefits' => 'array',
            'faq' => 'array',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
            'legacy_product_id' => 'integer',
            'meta' => 'array',
            'published_at' => 'datetime',
        ];
    }
}
