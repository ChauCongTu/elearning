<?php

namespace App\Http\Controllers\Public;

use App\Contracts\Consultation\ConsultationServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Public\StoreConsultationRequest;
use Illuminate\Http\RedirectResponse;

class ConsultationController extends Controller
{
    public function __construct(
        private ConsultationServiceInterface $consultations,
    ) {}

    public function store(StoreConsultationRequest $request): RedirectResponse
    {
        $this->consultations->store($request->validated());

        return back()->with('consultation_success', true);
    }
}
