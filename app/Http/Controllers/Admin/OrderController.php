<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Admin\AdminOrderServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private AdminOrderServiceInterface $orders,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('admin/orders/index', [
            'orders' => $this->orders->paginateForAdmin($request->only(['search', 'status', 'from', 'to'])),
            'filters' => $request->only(['search', 'status', 'from', 'to']),
        ]);
    }

    public function show(Order $order): Response
    {
        return Inertia::render('admin/orders/show', [
            'order' => $this->orders->show($order),
        ]);
    }
}
