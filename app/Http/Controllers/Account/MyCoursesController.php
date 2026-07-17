<?php

namespace App\Http\Controllers\Account;

use App\Contracts\Enrollment\EnrollmentServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyCoursesController extends Controller
{
    public function __construct(
        private EnrollmentServiceInterface $enrollments,
    ) {}

    public function __invoke(Request $request): Response
    {
        return Inertia::render('account/courses', [
            'enrollments' => $this->enrollments->listActiveForUser($request->user()),
        ]);
    }
}
