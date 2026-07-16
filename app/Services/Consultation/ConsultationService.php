<?php

namespace App\Services\Consultation;

use App\Contracts\Consultation\ConsultationServiceInterface;
use App\Models\ConsultationRequest;

class ConsultationService implements ConsultationServiceInterface
{
    public function store(array $data): ConsultationRequest
    {
        return ConsultationRequest::create($data);
    }
}
