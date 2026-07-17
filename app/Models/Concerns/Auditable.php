<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Schema;

trait Auditable
{
    public static function bootAuditable(): void
    {
        static::creating(function ($model): void {
            if (! auth()->check()) {
                return;
            }

            if (static::hasAuditColumns($model, 'created_by') && empty($model->created_by)) {
                $model->created_by = auth()->id();
            }

            if (static::hasAuditColumns($model, 'updated_by') && empty($model->updated_by)) {
                $model->updated_by = auth()->id();
            }
        });

        static::updating(function ($model): void {
            if (! auth()->check()) {
                return;
            }

            if (static::hasAuditColumns($model, 'updated_by')) {
                $model->updated_by = auth()->id();
            }
        });
    }

    protected static function hasAuditColumns(object $model, string $column): bool
    {
        return Schema::hasColumn($model->getTable(), $column);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }
}
