<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['order_id', 'gateway', 'payload', 'amount', 'received_at'])]
class Payment extends Model
{
    public $timestamps = true;

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'amount' => 'decimal:0',
            'received_at' => 'datetime',
        ];
    }
}
