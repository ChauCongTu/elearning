<?php

namespace App\Notifications;

use App\Models\Student;
use App\Notifications\Concerns\BuildsBrandedMailMessage;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class StudentCertificateNotification extends Notification
{
    use BuildsBrandedMailMessage, Queueable;

    public function __construct(
        public Student $student,
        public ?string $pdfPath = null,
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
        $lookupUrl = url('/thong-tin?q='.urlencode($this->student->student_code));

        $message = $this->brandedMail(
            'course_completed',
            'Mã tra cứu chứng chỉ — '.$this->student->student_code,
        )->markdown('mail.student-code', $this->mailViewData([
            'student' => $this->student,
            'lookupUrl' => $lookupUrl,
        ]));

        if ($this->pdfPath !== null && file_exists($this->pdfPath)) {
            $message->attach($this->pdfPath, [
                'as' => 'chung-chi-'.$this->student->student_code.'.pdf',
                'mime' => 'application/pdf',
            ]);
        }

        return $message;
    }
}
