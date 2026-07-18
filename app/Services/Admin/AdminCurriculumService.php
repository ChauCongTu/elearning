<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminCurriculumServiceInterface;
use App\Contracts\Files\FileServiceInterface;
use App\Enums\FilePrefix;
use App\Models\Chapter;
use App\Models\Course;
use App\Models\Lesson;

class AdminCurriculumService implements AdminCurriculumServiceInterface
{
    public function __construct(
        private FileServiceInterface $files,
    ) {}

    public function getCurriculum(Course $course): array
    {
        return $course->chapters()
            ->with(['lessons' => fn ($q) => $q->orderBy('sort_order')])
            ->get()
            ->map(fn (Chapter $chapter) => [
                'id' => $chapter->id,
                'title' => $chapter->title,
                'sort_order' => $chapter->sort_order,
                'is_published' => $chapter->is_published,
                'lessons' => $chapter->lessons->map(fn (Lesson $lesson) => $this->lessonToArray($lesson))->all(),
            ])
            ->all();
    }

    public function createChapter(Course $course, array $data): array
    {
        $maxOrder = $course->chapters()->max('sort_order') ?? -1;

        $chapter = $course->chapters()->create([
            'title' => $data['title'],
            'sort_order' => $data['sort_order'] ?? ($maxOrder + 1),
            'is_published' => $data['is_published'] ?? true,
        ]);

        return $this->chapterToArray($chapter->load('lessons'));
    }

    public function updateChapter(Chapter $chapter, array $data): array
    {
        $chapter->fill([
            'title' => $data['title'] ?? $chapter->title,
            'sort_order' => $data['sort_order'] ?? $chapter->sort_order,
            'is_published' => $data['is_published'] ?? $chapter->is_published,
        ]);
        $chapter->save();

        return $this->chapterToArray($chapter->fresh()->load('lessons'));
    }

    public function deleteChapter(Chapter $chapter): void
    {
        foreach ($chapter->lessons as $lesson) {
            $this->deleteLessonFiles($lesson);
        }

        $chapter->delete();
    }

    public function reorderChapters(Course $course, array $orderedIds): void
    {
        foreach ($orderedIds as $index => $id) {
            Chapter::query()
                ->where('course_id', $course->id)
                ->where('id', $id)
                ->update(['sort_order' => $index]);
        }
    }

    public function createLesson(Chapter $chapter, array $data): array
    {
        $maxOrder = $chapter->lessons()->max('sort_order') ?? -1;

        $lesson = $chapter->lessons()->create([
            'title' => $data['title'],
            'sort_order' => $data['sort_order'] ?? ($maxOrder + 1),
            'video_s3_key' => $data['video_s3_key'] ?? null,
            'duration_seconds' => $data['duration_seconds'] ?? 0,
            'is_free_preview' => $data['is_free_preview'] ?? false,
            'is_published' => $data['is_published'] ?? true,
        ]);

        return $this->lessonToArray($lesson);
    }

    public function updateLesson(Lesson $lesson, array $data): array
    {
        $lesson->fill([
            'title' => $data['title'] ?? $lesson->title,
            'sort_order' => $data['sort_order'] ?? $lesson->sort_order,
            'video_s3_key' => array_key_exists('video_s3_key', $data) ? $data['video_s3_key'] : $lesson->video_s3_key,
            'duration_seconds' => $data['duration_seconds'] ?? $lesson->duration_seconds,
            'is_free_preview' => $data['is_free_preview'] ?? $lesson->is_free_preview,
            'is_published' => $data['is_published'] ?? $lesson->is_published,
        ]);
        $lesson->save();

        return $this->lessonToArray($lesson->fresh());
    }

    public function deleteLesson(Lesson $lesson): void
    {
        $this->deleteLessonFiles($lesson);
        $lesson->delete();
    }

    public function reorderLessons(Chapter $chapter, array $orderedIds): void
    {
        foreach ($orderedIds as $index => $id) {
            Lesson::query()
                ->where('chapter_id', $chapter->id)
                ->where('id', $id)
                ->update(['sort_order' => $index]);
        }
    }

    public function storeLessonVideo(Lesson $lesson, \Illuminate\Http\UploadedFile $file): Lesson
    {
        $path = $this->files->replace($file, FilePrefix::LessonVideo, $lesson->video_s3_key);
        $lesson->update(['video_s3_key' => $path]);

        return $lesson->fresh();
    }

    private function deleteLessonFiles(Lesson $lesson): void
    {
        if ($lesson->video_s3_key) {
            $this->files->delete($lesson->video_s3_key);
        }
    }

    /**
     * @return array<string, mixed>
     */
    private function chapterToArray(Chapter $chapter): array
    {
        return [
            'id' => $chapter->id,
            'title' => $chapter->title,
            'sort_order' => $chapter->sort_order,
            'is_published' => $chapter->is_published,
            'lessons' => $chapter->lessons->map(fn (Lesson $l) => $this->lessonToArray($l))->all(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function lessonToArray(Lesson $lesson): array
    {
        return [
            'id' => $lesson->id,
            'title' => $lesson->title,
            'sort_order' => $lesson->sort_order,
            'video_s3_key' => $lesson->video_s3_key,
            'duration_seconds' => $lesson->duration_seconds,
            'is_free_preview' => $lesson->is_free_preview,
            'is_published' => $lesson->is_published,
        ];
    }
}
