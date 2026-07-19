<?php

namespace App\Exceptions\Payment;

use Exception;

class CheckoutException extends Exception
{
    public function __construct(
        string $message,
        public readonly string $errorCode = 'checkout_error',
    ) {
        parent::__construct($message);
    }
}
