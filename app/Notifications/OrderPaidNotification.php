<?php

namespace App\Notifications;

use App\Models\Order;
use App\Notifications\Concerns\BuildsBrandedMailMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderPaidNotification extends Notification
{
    use BuildsBrandedMailMessage, Queueable;

    public function __construct(public Order $order) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $course = $this->order->items->first()?->course;

        return $this->brandedOrderMail(
            'order_paid',
            'Thanh toán thành công — đơn hàng '.$this->order->code,
        )->markdown('mail.order-paid', $this->mailViewData([
            'order' => $this->order,
            'user' => $notifiable,
            'course' => $course,
            'coursesUrl' => route('account.courses'),
        ]));
    }
}
