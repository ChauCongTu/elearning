<?php

namespace App\Models;

use App\Enums\StudentSource;
use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable([
    'stt',
    'name',
    'student_code',
    'cmnd',
    'cmnd_issue_date',
    'cmnd_issue_place',
    'birthday',
    'original_place',
    'ethnic',
    'course',
    'class_name',
    'graduation_date',
    'type',
    'enrollment_id',
    'user_id',
    'course_id',
    'source',
    'is_revoked',
    'revoked_at',
])]
class Student extends BaseModel
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory;

    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function courseRelation(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class);
    }

    public function isRevoked(): bool
    {
        return (bool) $this->is_revoked;
    }

    protected function casts(): array
    {
        return [
            'stt' => 'integer',
            'cmnd_issue_date' => 'date',
            'birthday' => 'date',
            'graduation_date' => 'date',
            'source' => StudentSource::class,
            'is_revoked' => 'boolean',
            'revoked_at' => 'datetime',
        ];
    }
}
