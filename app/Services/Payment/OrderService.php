<?php

namespace App\Services\Payment;

use App\Contracts\Mail\TransactionalMailServiceInterface;
use App\Contracts\Payment\OrderServiceInterface;
use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\OrderStatus;
use App\Exceptions\Payment\CheckoutException;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService implements OrderServiceInterface
{
    public function __construct(
        private TransactionalMailServiceInterface $transactionalMail,
    ) {}

    public function purchaseStateForCourse(User $user, Course $course): array
    {
        $isEnrolled = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('status', EnrollmentStatus::Active)
            ->exists();

        $pendingOrderCode = Order::query()
            ->where('user_id', $user->id)
            ->where('status', OrderStatus::Pending)
            ->where('expires_at', '>', now())
            ->whereHas('items', fn ($query) => $query->where('course_id', $course->id))
            ->value('code');

        return [
            'is_enrolled' => $isEnrolled,
            'pending_order_code' => $pendingOrderCode,
        ];
    }

    public function createForCourse(User $user, Course $course): Order
    {
        if (! $course->is_published) {
            throw new CheckoutException('Khóa học không khả dụng để mua.', 'course_unavailable');
        }

        if ((float) $course->price <= 0) {
            throw new CheckoutException('Khóa học này chưa có học phí.', 'course_free');
        }

        $isEnrolled = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->where('status', EnrollmentStatus::Active)
            ->exists();

        if ($isEnrolled) {
            throw new CheckoutException('Bạn đã sở hữu khóa học này.', 'already_enrolled');
        }

        $existingPending = Order::query()
            ->where('user_id', $user->id)
            ->where('status', OrderStatus::Pending)
            ->where('expires_at', '>', now())
            ->whereHas('items', fn ($query) => $query->where('course_id', $course->id))
            ->with(['items.course:id,title,slug'])
            ->first();

        if ($existingPending) {
            return $existingPending;
        }

        $expiryMinutes = max(1, (int) config('sepay.payment_expiry_minutes', 15));

        return DB::transaction(function () use ($user, $course, $expiryMinutes) {
            $order = Order::query()->create([
                'user_id' => $user->id,
                'code' => $this->generateOrderCode(),
                'status' => OrderStatus::Pending,
                'amount' => $course->price,
                'expires_at' => now()->addMinutes($expiryMinutes),
            ]);

            OrderItem::query()->create([
                'order_id' => $order->id,
                'course_id' => $course->id,
                'price' => $course->price,
            ]);

            $order = $order->load(['items.course:id,title,slug', 'user']);

            $this->transactionalMail->sendOrderCreated($order);

            return $order;
        });
    }

    public function findOwnedByCode(User $user, string $code): Order
    {
        return Order::query()
            ->where('code', $code)
            ->where('user_id', $user->id)
            ->with(['items.course:id,title,slug,thumbnail_path'])
            ->firstOrFail();
    }

    public function expirePendingOrders(): int
    {
        $orders = Order::query()
            ->where('status', OrderStatus::Pending)
            ->where('expires_at', '<=', now())
            ->with(['user', 'items.course:id,title,slug'])
            ->get();

        if ($orders->isEmpty()) {
            return 0;
        }

        $count = Order::query()
            ->whereIn('id', $orders->pluck('id'))
            ->update(['status' => OrderStatus::Expired]);

        foreach ($orders as $order) {
            $this->transactionalMail->sendOrderExpired($order);
        }

        return $count;
    }

    private function generateOrderCode(): string
    {
        $prefix = config('sepay.order_code_prefix', 'ELN').now()->format('Ymd');

        do {
            $lastCode = Order::withTrashed()
                ->where('code', 'like', $prefix.'%')
                ->orderByDesc('code')
                ->value('code');

            $sequence = $lastCode ? ((int) substr($lastCode, -4)) + 1 : 1;
            $code = $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
        } while (Order::withTrashed()->where('code', $code)->exists());

        return $code;
    }
}
