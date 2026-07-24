<?php

namespace App\Services\Mail;

use App\Contracts\Mail\TransactionalMailServiceInterface;
use App\Enums\UserRole;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\User;
use App\Notifications\CourseCompletedNotification;
use App\Notifications\EnrollmentGrantedNotification;
use App\Notifications\OrderCreatedNotification;
use App\Notifications\OrderExpiredNotification;
use App\Notifications\OrderPaidNotification;
use App\Notifications\RegistrationWelcomeNotification;
use App\Notifications\RoleChangedNotification;

class TransactionalMailService implements TransactionalMailServiceInterface
{
    public function sendRegistrationWelcome(User $user): void
    {
        if (! $this->canSendTo($user)) {
            return;
        }

        $user->notify(new RegistrationWelcomeNotification);
    }

    public function sendOrderCreated(Order $order): void
    {
        $order->loadMissing(['user', 'items.course']);

        if (! $this->canSendTo($order->user)) {
            return;
        }

        $order->user->notify(new OrderCreatedNotification($order));
    }

    public function sendOrderPaid(Order $order): void
    {
        $order->loadMissing(['user', 'items.course']);

        if (! $this->canSendTo($order->user)) {
            return;
        }

        $order->user->notify(new OrderPaidNotification($order));
    }

    public function sendOrderExpired(Order $order): void
    {
        $order->loadMissing(['user', 'items.course']);

        if (! $this->canSendTo($order->user)) {
            return;
        }

        $order->user->notify(new OrderExpiredNotification($order));
    }

    public function sendCourseCompleted(Enrollment $enrollment): void
    {
        $enrollment->loadMissing(['user', 'course']);

        if (! $this->canSendTo($enrollment->user)) {
            return;
        }

        $enrollment->user->notify(new CourseCompletedNotification($enrollment));
    }

    public function sendRoleChanged(User $user, UserRole $previousRole, UserRole $newRole): void
    {
        if ($previousRole === $newRole || ! $this->canSendTo($user)) {
            return;
        }

        $user->notify(new RoleChangedNotification($previousRole, $newRole));
    }

    public function sendEnrollmentGranted(User $user, Enrollment $enrollment): void
    {
        $enrollment->loadMissing('course');

        if (! $this->canSendTo($user)) {
            return;
        }

        $user->notify(new EnrollmentGrantedNotification($enrollment));
    }

    private function canSendTo(?User $user): bool
    {
        return $user !== null && filled($user->email);
    }
}
