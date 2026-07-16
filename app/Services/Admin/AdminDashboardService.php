<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminDashboardServiceInterface;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\User;

class AdminDashboardService implements AdminDashboardServiceInterface
{
    public function getStats(): array
    {
        return [
            'users' => User::query()->count(),
            'courses' => Course::query()->count(),
            'enrollments' => Enrollment::query()->count(),
            'orders' => Order::query()->count(),
        ];
    }
}
