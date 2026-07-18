<?php

namespace App\Http\Controllers\Learn;

use App\Contracts\Learning\LearningServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LearningController extends Controller
{
    public function __construct(
        private LearningServiceInterface $learning,
    ) {}

    public function redirect(Request $request, string $course): RedirectResponse
    {
        $publishedCourse = $this->learning->findPublishedCourseOrFail($course);
        $lesson = $this->learning->resolveResumeLesson($publishedCourse, $request->user());

        if ($lesson === null) {
            abort(404, 'Khóa học chưa có bài học.');
        }

        if (! $this->learning->canAccessLesson($request->user(), $lesson, $publishedCourse)) {
            abort(403);
        }

        return redirect()->route('learn.lessons.show', [
            'course' => $publishedCourse->slug,
            'lesson' => $lesson,
        ]);
    }

    public function show(Request $request, string $course, Lesson $lesson): Response|RedirectResponse
    {
        $publishedCourse = $this->learning->findPublishedCourseOrFail($course);
        $this->learning->ensureLessonBelongsToCourse($lesson, $publishedCourse);

        $user = $request->user();

        if (! $this->learning->canAccessLesson($user, $lesson, $publishedCourse)) {
            if ($user === null) {
                return redirect()->guest(route('login'));
            }

            abort(403);
        }

        return Inertia::render('learn/player', $this->learning->buildPlayerPayload(
            $publishedCourse,
            $lesson,
            $user,
        ));
    }
}
