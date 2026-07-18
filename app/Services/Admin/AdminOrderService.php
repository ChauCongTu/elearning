<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminOrderServiceInterface;
use App\Enums\OrderStatus;
use App\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AdminOrderService implements AdminOrderServiceInterface
{
    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Order::query()
            ->with(['user:id,name,email', 'items.course:id,title'])
            ->orderByDesc('created_at');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['from'])) {
            $query->whereDate('created_at', '>=', $filters['from']);
        }

        if (! empty($filters['to'])) {
            $query->whereDate('created_at', '<=', $filters['to']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                    ->orWhereHas('user', fn ($u) => $u
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%"));
            });
        }

        return $query->paginate($perPage)->withQueryString()->through(fn (Order $order) => $this->toListArray($order));
    }

    public function show(Order $order): array
    {
        $order->load([
            'user:id,name,email,phone',
            'items.course:id,title,slug',
            'payments',
        ]);

        return [
            'id' => $order->id,
            'code' => $order->code,
            'status' => $order->status->value,
            'amount' => (string) $order->amount,
            'paid_at' => $order->paid_at?->toIso8601String(),
            'sepay_transaction_id' => $order->sepay_transaction_id,
            'expires_at' => $order->expires_at?->toIso8601String(),
            'created_at' => $order->created_at?->toIso8601String(),
            'user' => $order->user ? [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'email' => $order->user->email,
                'phone' => $order->user->phone,
            ] : null,
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'price' => (string) $item->price,
                'course' => $item->course ? [
                    'id' => $item->course->id,
                    'title' => $item->course->title,
                    'slug' => $item->course->slug,
                ] : null,
            ])->all(),
            'payments' => $order->payments->map(fn ($payment) => [
                'id' => $payment->id,
                'gateway' => $payment->gateway,
                'amount' => (string) $payment->amount,
                'received_at' => $payment->received_at?->toIso8601String(),
            ])->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function toListArray(Order $order): array
    {
        return [
            'id' => $order->id,
            'code' => $order->code,
            'status' => $order->status->value,
            'amount' => (string) $order->amount,
            'paid_at' => $order->paid_at?->toIso8601String(),
            'created_at' => $order->created_at?->toIso8601String(),
            'user' => $order->user ? [
                'id' => $order->user->id,
                'name' => $order->user->name,
                'email' => $order->user->email,
            ] : null,
            'courses' => $order->items
                ->map(fn ($item) => $item->course?->title)
                ->filter()
                ->values()
                ->all(),
        ];
    }
}
