<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PurchaseHistoryController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with(['items.course:id,title,slug,thumbnail_path'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Order $order) => [
                'id' => $order->id,
                'code' => $order->code,
                'status' => $order->status->value,
                'amount' => (string) $order->amount,
                'paid_at' => $order->paid_at?->toIso8601String(),
                'created_at' => $order->created_at?->toIso8601String(),
                'items' => $order->items->map(fn ($item) => [
                    'id' => $item->id,
                    'price' => (string) $item->price,
                    'course' => $item->course ? [
                        'id' => $item->course->id,
                        'title' => $item->course->title,
                        'slug' => $item->course->slug,
                        'thumbnail_path' => $item->course->thumbnail_path,
                    ] : null,
                ])->all(),
            ])
            ->all();

        return Inertia::render('account/purchases', [
            'orders' => $orders,
        ]);
    }
}
