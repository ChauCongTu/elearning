<?php

namespace App\Models;

use App\Enums\OrderStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'code',
    'status',
    'amount',
    'paid_at',
    'sepay_transaction_id',
    'legacy_order_id',
    'expires_at',
])]
class Order extends BaseModel
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function manualCompletions(): HasMany
    {
        return $this->hasMany(OrderManualCompletion::class);
    }

    public function isPaid(): bool
    {
        return $this->status === OrderStatus::Paid;
    }

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'amount' => 'decimal:0',
            'paid_at' => 'datetime',
            'legacy_order_id' => 'integer',
            'expires_at' => 'datetime',
        ];
    }
}
