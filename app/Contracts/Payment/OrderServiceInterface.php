<?php

namespace App\Contracts\Payment;

use App\Models\Course;
use App\Models\Order;
use App\Models\User;

interface OrderServiceInterface
{
    /**
     * @return array{is_enrolled: bool, pending_order_code: string|null}
     */
    public function purchaseStateForCourse(User $user, Course $course): array;

    public function createForCourse(User $user, Course $course): Order;

    public function findOwnedByCode(User $user, string $code): Order;

    public function expirePendingOrders(): int;
}
