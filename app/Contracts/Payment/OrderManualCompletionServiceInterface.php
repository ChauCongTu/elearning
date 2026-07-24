<?php

namespace App\Contracts\Payment;

use App\Models\Order;
use App\Models\User;

interface OrderManualCompletionServiceInterface
{
    /**
     * @return array{status: string, order_code: string}
     */
    public function complete(Order $order, User $admin, ?string $note = null, ?string $ipAddress = null): array;
}
