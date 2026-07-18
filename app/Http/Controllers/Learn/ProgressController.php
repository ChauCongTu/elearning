<?php

namespace App\Http\Controllers\Learn;

use App\Contracts\Learning\EnrollmentProgressServiceInterface;
use App\Contracts\Learning\LearningServiceInterface;
use App\Http\Controllers\Controller;
use App\Http\Requests\Learn\UpdateProgressRequest;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;

class ProgressController extends Controller
{
    public function __construct(
        private LearningServiceInterface $learning,
        private EnrollmentProgressServiceInterface $progress,
    ) {}

    public function update(UpdateProgressRequest $request): JsonResponse
    {
        $user = $request->user();
        $lesson = Lesson::query()->findOrFail($request->validated('lesson_id'));
        $lesson->loadMissing('chapter.course');
        $course = $lesson->chapter?->course;

        if ($course === null) {
            abort(404);
        }

        if (! $this->learning->canAccessLesson($user, $lesson, $course)) {
            abort(403);
        }

        $enrollment = $this->learning->findActiveEnrollment($user, $course);

        if ($enrollment === null) {
            abort(403, 'Cần đăng ký khóa học để lưu tiến độ.');
        }

        $record = $this->progress->updateProgress(
            $enrollment,
            $lesson,
            (int) $request->validated('watched_seconds'),
        );

        $enrollment->refresh();

        return response()->json([
            'watched_seconds' => $record->watched_seconds,
            'completed' => $record->completed,
            'progress_percent' => (string) $enrollment->progress_percent,
        ]);
    }
}
