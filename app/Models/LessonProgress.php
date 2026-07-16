<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'enrollment_id',
    'lesson_id',
    'watched_seconds',
    'completed',
    'last_watched_at',
])]
class LessonProgress extends Model
{
    protected $table = 'lesson_progress';

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    protected function casts(): array
    {
        return [
            'watched_seconds' => 'integer',
            'completed' => 'boolean',
            'last_watched_at' => 'datetime',
        ];
    }
}
