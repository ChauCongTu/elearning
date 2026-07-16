<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Admin\AdminDashboardServiceInterface;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private AdminDashboardServiceInterface $dashboard,
    ) {}

    public function __invoke(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => $this->dashboard->getStats(),
        ]);
    }
}
