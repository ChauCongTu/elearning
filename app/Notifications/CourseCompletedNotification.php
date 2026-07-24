<?php

namespace App\Notifications;

use App\Models\Enrollment;
use App\Notifications\Concerns\BuildsBrandedMailMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CourseCompletedNotification extends Notification
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
        $courseTitle = $this->enrollment->course?->title ?? 'khóa học';

        return $this->brandedMail(
            'course_completed',
            'Chúc mừng! Bạn đã hoàn thành '.$courseTitle,
        )->markdown('mail.course-completed', $this->mailViewData([
            'enrollment' => $this->enrollment,
            'user' => $notifiable,
            'course' => $this->enrollment->course,
            'coursesUrl' => route('account.courses'),
            'certificatesUrl' => route('account.certificates'),
        ]));
    }
}
