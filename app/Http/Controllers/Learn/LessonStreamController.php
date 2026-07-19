<?php

namespace App\Http\Controllers\Learn;

use App\Contracts\Learning\LearningServiceInterface;
use App\Contracts\Video\VideoStreamServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class LessonStreamController extends Controller
{
    public function __construct(
        private LearningServiceInterface $learning,
        private VideoStreamServiceInterface $videoStream,
    ) {}

    public function __invoke(Request $request, Lesson $lesson): StreamedResponse
    {
        if (! $this->allowsEmbeddedPlayback($request)) {
            abort(403, 'Video chỉ phát được trong trang học.');
        }

        $lesson->loadMissing('chapter.course');
        $course = $lesson->chapter?->course;

        if ($course === null || ! $course->is_published) {
            abort(404);
        }

        $user = $request->user();

        if (! $this->learning->canAccessLesson($user, $lesson, $course)) {
            abort(403);
        }

        return $this->videoStream->stream($lesson, $request->header('Range'));
    }

    private function allowsEmbeddedPlayback(Request $request): bool
    {
        $dest = $request->header('Sec-Fetch-Dest');
        $mode = $request->header('Sec-Fetch-Mode');

        if ($dest === null && $mode === null) {
            return true;
        }

        if ($dest === 'video') {
            return true;
        }

        if ($dest === 'empty' && in_array($mode, ['no-cors', 'cors', null], true)) {
            return true;
        }

        return false;
    }
}
