<?php

namespace App\Notifications;

use App\Notifications\Concerns\BuildsBrandedMailMessage;
use App\Support\MailBranding;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RegistrationWelcomeNotification extends Notification
{
    use BuildsBrandedMailMessage, Queueable;

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return $this->brandedMail(
            'registration',
            'Chào mừng bạn đến với '.MailBranding::siteName(),
        )->markdown('mail.registration-welcome', $this->mailViewData([
            'user' => $notifiable,
            'loginUrl' => route('login'),
        ]));
    }
}
