<?php

namespace App\Contracts\Mail;

use App\Enums\UserRole;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\User;

interface TransactionalMailServiceInterface
{
    public function sendRegistrationWelcome(User $user): void;

    public function sendOrderCreated(Order $order): void;

    public function sendOrderPaid(Order $order): void;

    public function sendOrderExpired(Order $order): void;

    public function sendCourseCompleted(Enrollment $enrollment): void;

    public function sendRoleChanged(User $user, UserRole $previousRole, UserRole $newRole): void;

    public function sendEnrollmentGranted(User $user, Enrollment $enrollment): void;
}
