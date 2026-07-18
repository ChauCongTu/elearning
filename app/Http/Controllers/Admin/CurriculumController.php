<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Admin\AdminCurriculumServiceInterface;
use App\Contracts\Files\FileServiceInterface;
use App\Contracts\Video\VideoStreamServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Course;
use App\Models\Lesson;
use App\Services\Admin\AdminCurriculumService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CurriculumController extends Controller
{
    public function __construct(
        private AdminCurriculumServiceInterface $curriculum,
        private VideoStreamServiceInterface $videoStream,
        private FileServiceInterface $files,
    ) {}

    public function index(Course $course): Response
    {
        return Inertia::render('admin/courses/curriculum', [
            'course' => [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
            ],
            'chapters' => $this->curriculum->getCurriculum($course),
        ]);
    }

    public function storeChapter(Request $request, Course $course): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $this->curriculum->createChapter($course, $data);

        return back()->with('success', 'Đã thêm chương.');
    }

    public function updateChapter(Request $request, Chapter $chapter): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
        ]);

        $this->curriculum->updateChapter($chapter, [
            'title' => $data['title'],
            'is_published' => $request->boolean('is_published'),
        ]);

        return back()->with('success', 'Đã cập nhật chương.');
    }

    public function destroyChapter(Chapter $chapter): RedirectResponse
    {
        $this->curriculum->deleteChapter($chapter);

        return back()->with('success', 'Đã xóa chương.');
    }

    public function reorderChapters(Request $request, Course $course): RedirectResponse
    {
        $data = $request->validate([
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['uuid'],
        ]);

        $this->curriculum->reorderChapters($course, $data['ordered_ids']);

        return back()->with('success', 'Đã sắp xếp chương.');
    }

    public function storeLesson(Request $request, Chapter $chapter): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'is_free_preview' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
            'video' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:512000'],
        ]);

        $lessonData = $this->curriculum->createLesson($chapter, $data);

        if ($request->hasFile('video')) {
            $lesson = Lesson::findOrFail($lessonData['id']);
            $this->curriculumService()->storeLessonVideo($lesson, $request->file('video'));
        }

        return back()->with('success', 'Đã thêm bài học.');
    }

    public function updateLesson(Request $request, Lesson $lesson): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
            'is_free_preview' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
            'video' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm,video/quicktime', 'max:512000'],
        ]);

        unset($data['video']);

        $this->curriculum->updateLesson($lesson, [
            'title' => $data['title'],
            'duration_seconds' => $data['duration_seconds'] ?? $lesson->duration_seconds,
            'is_free_preview' => $request->boolean('is_free_preview'),
            'is_published' => $request->boolean('is_published'),
        ]);

        if ($request->hasFile('video')) {
            $this->curriculumService()->storeLessonVideo($lesson, $request->file('video'));
        }

        return back()->with('success', 'Đã cập nhật bài học.');
    }

    public function destroyLesson(Lesson $lesson): RedirectResponse
    {
        $this->curriculum->deleteLesson($lesson);

        return back()->with('success', 'Đã xóa bài học.');
    }

    public function reorderLessons(Request $request, Chapter $chapter): RedirectResponse
    {
        $data = $request->validate([
            'ordered_ids' => ['required', 'array'],
            'ordered_ids.*' => ['uuid'],
        ]);

        $this->curriculum->reorderLessons($chapter, $data['ordered_ids']);

        return back()->with('success', 'Đã sắp xếp bài học.');
    }

    public function uploadUrl(Request $request, Lesson $lesson): \Illuminate\Http\JsonResponse
    {
        $data = $request->validate([
            'content_type' => ['required', 'string', 'max:255'],
        ]);

        return response()->json(
            $this->videoStream->presignedUpload($lesson, $data['content_type']),
        );
    }

    public function confirmVideo(Request $request, Lesson $lesson): RedirectResponse
    {
        $data = $request->validate([
            'video_s3_key' => ['required', 'string', 'max:500'],
            'duration_seconds' => ['nullable', 'integer', 'min:0'],
        ]);

        if ($lesson->video_s3_key && $lesson->video_s3_key !== $data['video_s3_key']) {
            $this->files->delete($lesson->video_s3_key);
        }

        $this->curriculum->updateLesson($lesson, [
            'title' => $lesson->title,
            'video_s3_key' => $data['video_s3_key'],
            'duration_seconds' => $data['duration_seconds'] ?? $lesson->duration_seconds,
            'is_free_preview' => $lesson->is_free_preview,
            'is_published' => $lesson->is_published,
        ]);

        return back()->with('success', 'Đã xác nhận video bài học.');
    }

    private function curriculumService(): AdminCurriculumService
    {
        return app(AdminCurriculumService::class);
    }
}
