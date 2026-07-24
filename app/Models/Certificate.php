<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'enrollment_id',
    'student_id',
    'file_path',
    'issued_at',
    'certificate_email_sent_at',
])]
class Certificate extends BaseModel
{
    public function enrollment(): BelongsTo
    {
        return $this->belongsTo(Enrollment::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'certificate_email_sent_at' => 'datetime',
        ];
    }
}
