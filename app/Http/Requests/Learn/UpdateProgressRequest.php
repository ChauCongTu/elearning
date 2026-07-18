<?php

namespace App\Http\Requests\Learn;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'lesson_id' => ['required', 'uuid', 'exists:lessons,id'],
            'watched_seconds' => ['required', 'integer', 'min:0'],
        ];
    }
}
