<?php

namespace App\Notifications;

use App\Enums\UserRole;
use App\Notifications\Concerns\BuildsBrandedMailMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RoleChangedNotification extends Notification
{
    use BuildsBrandedMailMessage, Queueable;

    public function __construct(
        public UserRole $previousRole,
        public UserRole $newRole,
    ) {}

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
            'role_changed',
            'Quyền tài khoản của bạn đã được cập nhật',
        )->markdown('mail.role-changed', $this->mailViewData([
            'user' => $notifiable,
            'previousRoleLabel' => $this->roleLabel($this->previousRole),
            'newRoleLabel' => $this->roleLabel($this->newRole),
            'loginUrl' => route('login'),
        ]));
    }

    private function roleLabel(UserRole $role): string
    {
        return match ($role) {
            UserRole::Admin => 'Quản trị viên',
            UserRole::Student => 'Học viên',
        };
    }
}
