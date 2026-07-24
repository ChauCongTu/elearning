<?php

namespace App\Notifications;

use App\Models\Enrollment;
use App\Notifications\Concerns\BuildsBrandedMailMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EnrollmentGrantedNotification extends Notification
{
    use BuildsBrandedMailMessage, Queueable;

    public function __construct(public Enrollment $enrollment) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $course = $this->enrollment->course;
        $courseTitle = $course?->title ?? 'khóa học';

        return $this->brandedMail(
            'enrollment_granted',
            'Bạn đã được cấp quyền học: '.$courseTitle,
        )->markdown('mail.enrollment-granted', $this->mailViewData([
            'user' => $notifiable,
            'enrollment' => $this->enrollment,
            'course' => $course,
            'learnUrl' => $course ? route('learn.show', $course->slug) : route('account.courses'),
        ]));
    }
}
