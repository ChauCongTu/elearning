<?php

namespace App\Contracts\Admin;

use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AdminOrderServiceInterface
{
    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    public function show(Order $order): array;
}
