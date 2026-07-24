<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Admin\AdminOrderServiceInterface;
use App\Contracts\Payment\OrderManualCompletionServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function __construct(
        private AdminOrderServiceInterface $orders,
        private OrderManualCompletionServiceInterface $manualCompletions,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('admin/orders/index', [
            'orders' => $this->orders->paginateForAdmin($request->only(['search', 'status', 'from', 'to'])),
            'filters' => $request->only(['search', 'status', 'from', 'to']),
        ]);
    }

    public function show(Request $request, Order $order): Response
    {
        return Inertia::render('admin/orders/show', [
            'order' => $this->orders->show($order),
            'canCompleteOrder' => $request->user()?->canCompleteOrders() ?? false,
        ]);
    }

    public function complete(Request $request, Order $order): RedirectResponse
    {
        $data = $request->validate([
            'note' => ['nullable', 'string', 'max:2000'],
        ]);

        $result = $this->manualCompletions->complete(
            $order,
            $request->user(),
            $data['note'] ?? null,
            $request->ip(),
        );

        if ($result['status'] === 'already_paid') {
            return back()->with('error', 'Đơn hàng đã được thanh toán trước đó.');
        }

        return back()->with('success', 'Đã xác nhận thanh toán và mở khóa học cho học viên.');
    }
}
