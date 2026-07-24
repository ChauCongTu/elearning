<?php

namespace App\Notifications;

use App\Models\Order;
use App\Notifications\Concerns\BuildsBrandedMailMessage;
use App\Support\MailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCreatedNotification extends Notification
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
        return $this->brandedOrderMail(
            'order_created',
            'Đơn hàng '.$this->order->code.' đã được tạo',
        )->markdown('mail.order-created', $this->mailViewData([
            'order' => $this->order,
            'user' => $notifiable,
            'paymentUrl' => route('checkout.payment', $this->order->code),
        ]));
    }
}
