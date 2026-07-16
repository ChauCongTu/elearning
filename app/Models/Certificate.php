<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'enrollment_id',
    'verification_code',
    'student_name',
    'course_title',
    'issued_at',
    'pdf_path',
])]
class Certificate extends Model
{
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
        ];
    }
}
