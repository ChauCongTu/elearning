<?php

namespace App\Notifications\Concerns;

use App\Support\MailBranding;
use App\Support\TransactionalMail;
use Illuminate\Notifications\Messages\MailMessage;

trait BuildsBrandedMailMessage
{
    protected function brandedMail(string $case, string $subject): MailMessage
    {
        $from = TransactionalMail::from($case);

        return (new MailMessage)
            ->from($from->address, $from->name)
            ->subject($subject);
    }

    protected function brandedOrderMail(string $case, string $subject): MailMessage
    {
        return TransactionalMail::applyOrderAdminBcc(
            $this->brandedMail($case, $subject),
        );
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function mailViewData(array $data = []): array
    {
        return array_merge(MailBranding::viewData(), $data);
    }
}
