<?php

namespace App\Services\Payment;

use App\Contracts\Mail\TransactionalMailServiceInterface;
use App\Contracts\Payment\OrderManualCompletionServiceInterface;
use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\OrderStatus;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\OrderManualCompletion;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class OrderManualCompletionService implements OrderManualCompletionServiceInterface
{
    public function __construct(
        private TransactionalMailServiceInterface $transactionalMail,
    ) {}

    public function complete(Order $order, User $admin, ?string $note = null, ?string $ipAddress = null): array
    {
        if (! $admin->canCompleteOrders()) {
            throw ValidationException::withMessages([
                'order' => 'Bạn không có quyền xác nhận thanh toán thủ công.',
            ]);
        }

        if ($order->isPaid()) {
            return [
                'status' => 'already_paid',
                'order_code' => $order->code,
            ];
        }

        if (! in_array($order->status, [OrderStatus::Pending, OrderStatus::Expired], true)) {
            throw ValidationException::withMessages([
                'order' => 'Đơn hàng không ở trạng thái có thể hoàn tất.',
            ]);
        }

        $wasMarkedPaid = false;

        DB::transaction(function () use ($order, $admin, $note, $ipAddress, &$wasMarkedPaid) {
            $order->refresh()->load('items');

            if ($order->isPaid()) {
                return;
            }

            Payment::query()->create([
                'order_id' => $order->id,
                'gateway' => 'manual_admin',
                'payload' => [
                    'note' => $note,
                    'completed_by' => $admin->id,
                    'completed_by_name' => $admin->name,
                ],
                'amount' => $order->amount,
                'received_at' => now(),
            ]);

            $order->update([
                'status' => OrderStatus::Paid,
                'paid_at' => now(),
            ]);

            OrderManualCompletion::query()->create([
                'order_id' => $order->id,
                'completed_by' => $admin->id,
                'note' => $note,
                'ip_address' => $ipAddress,
            ]);

            foreach ($order->items as $item) {
                Enrollment::query()->updateOrCreate(
                    [
                        'user_id' => $order->user_id,
                        'course_id' => $item->course_id,
                    ],
                    [
                        'status' => EnrollmentStatus::Active,
                        'source' => EnrollmentSource::Purchase,
                        'enrolled_at' => now(),
                        'progress_percent' => 0,
                    ],
                );
            }

            $wasMarkedPaid = true;
        });

        if ($wasMarkedPaid) {
            $this->transactionalMail->sendOrderPaid($order->fresh(['user', 'items.course']));
        }

        return [
            'status' => $wasMarkedPaid ? 'paid' : 'already_paid',
            'order_code' => $order->fresh()->code,
        ];
    }
}
