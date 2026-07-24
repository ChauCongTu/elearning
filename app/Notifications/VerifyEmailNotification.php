<?php

namespace App\Notifications;

use App\Notifications\Concerns\BuildsBrandedMailMessage;
use App\Support\MailBranding;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailNotification extends VerifyEmail
{
    use BuildsBrandedMailMessage;

    /**
     * @param  mixed  $notifiable
     */
    public function toMail($notifiable): MailMessage
    {
        $verificationUrl = $this->verificationUrl($notifiable);

        return $this->brandedMail(
            'email_verification',
            'Xác minh email — '.MailBranding::siteName(),
        )->markdown('mail.verify-email', $this->mailViewData([
            'userName' => $notifiable->name,
            'verificationUrl' => $verificationUrl,
            'expireMinutes' => (int) config('auth.verification.expire', 60),
        ]));
    }
}
