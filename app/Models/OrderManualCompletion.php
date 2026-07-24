<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'order_id',
    'completed_by',
    'note',
    'ip_address',
])]
class OrderManualCompletion extends Model
{
    use HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function completedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
