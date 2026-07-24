<?php

namespace App\Listeners;

use App\Contracts\Mail\TransactionalMailServiceInterface;
use Illuminate\Auth\Events\Registered;

class SendRegistrationWelcomeEmail
{
    public function __construct(
        private TransactionalMailServiceInterface $transactionalMail,
    ) {}

    public function handle(Registered $event): void
    {
        $this->transactionalMail->sendRegistrationWelcome($event->user);
    }
}
