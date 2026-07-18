<?php

namespace App\Contracts\Admin;

interface AdminDashboardServiceInterface
{
    /**
     * @return array<string, mixed>
     */
    public function getOverview(): array;
}
