<?php

namespace App\Contracts\Admin;

interface AdminDashboardServiceInterface
{
    /**
     * @return array{users: int, courses: int, enrollments: int, orders: int}
     */
    public function getStats(): array;
}
