<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\CertificateTemplateType;
use App\Models\Concerns\ResolvesMediaUrl;
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
    'purchase_count_offset',
    'certificate_template_type',
    'certificate_template',
    'published_at',
])]
class Course extends BaseModel
{
    use ResolvesMediaUrl;

    protected $appends = ['purchase_count', 'thumbnail_url'];

    public function getThumbnailUrlAttribute(): ?string
    {
        return $this->resolveMediaUrl($this->thumbnail_path);
    }

    public function getPurchaseCountAttribute(): int
    {
        return $this->displayPurchaseCount();
    }

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

    public function reviews(): HasMany
    {
        return $this->hasMany(CourseReview::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function displayPurchaseCount(): int
    {
        $real = array_key_exists('paid_order_items_count', $this->attributes)
            ? (int) $this->attributes['paid_order_items_count']
            : $this->orderItems()
                ->whereHas('order', fn ($query) => $query->where('status', OrderStatus::Paid))
                ->count();

        return $real + (int) ($this->purchase_count_offset ?? 0);
    }

    public function scopeWithPurchaseCount($query)
    {
        return $query->withCount([
            'orderItems as paid_order_items_count' => fn ($items) => $items
                ->whereHas('order', fn ($order) => $order->where('status', OrderStatus::Paid)),
        ]);
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
            'purchase_count_offset' => 'integer',
            'meta' => 'array',
            'certificate_template_type' => CertificateTemplateType::class,
            'published_at' => 'datetime',
        ];
    }
}
