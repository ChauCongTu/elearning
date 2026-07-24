<?php

namespace App\Notifications;

use App\Models\Order;
use App\Notifications\Concerns\BuildsBrandedMailMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderExpiredNotification extends Notification
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
            'order_expired',
            'Đơn hàng '.$this->order->code.' đã hết hạn thanh toán',
        )->markdown('mail.order-expired', $this->mailViewData([
            'order' => $this->order,
            'user' => $notifiable,
            'course' => $course,
            'courseUrl' => $course ? route('courses.show', $course->slug) : route('courses.index'),
        ]));
    }
}
