<?php

namespace App\Contracts\Consultation;

use App\Models\ConsultationRequest;

interface ConsultationServiceInterface
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function store(array $data): ConsultationRequest;
}
