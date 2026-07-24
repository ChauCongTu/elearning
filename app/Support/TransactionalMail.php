<?php

namespace App\Support;

use Illuminate\Mail\Mailables\Address;
use Illuminate\Notifications\Messages\MailMessage;

final class TransactionalMail
{
    public static function from(string $case): Address
    {
        $caseConfig = config("transactional-mail.cases.{$case}", []);
        $default = config('transactional-mail.default', []);
        $mailFrom = config('mail.from', []);

        $address = $caseConfig['address']
            ?? $default['address']
            ?? ($mailFrom['address'] ?? 'hello@example.com');

        $name = $caseConfig['name']
            ?? $default['name']
            ?? ($mailFrom['name'] ?? config('app.name', 'Laravel'));

        return new Address($address, $name);
    }

    /**
     * @return list<string>
     */
    public static function orderAdminBcc(): array
    {
        $addresses = config('transactional-mail.order_admin_bcc', []);

        if (! is_array($addresses)) {
            return [];
        }

        return array_values(array_filter(
            array_map(static fn ($email) => is_string($email) ? trim($email) : '', $addresses),
            static fn (string $email): bool => $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL),
        ));
    }

    public static function applyOrderAdminBcc(MailMessage $message): MailMessage
    {
        foreach (self::orderAdminBcc() as $address) {
            $message->bcc($address);
        }

        return $message;
    }
}
