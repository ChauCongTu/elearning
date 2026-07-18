<?php

namespace App\Contracts\Admin;

use App\Models\Chapter;
use App\Models\Course;
use App\Models\Lesson;

interface AdminCurriculumServiceInterface
{
    public function getCurriculum(Course $course): array;

    public function createChapter(Course $course, array $data): array;

    public function updateChapter(Chapter $chapter, array $data): array;

    public function deleteChapter(Chapter $chapter): void;

    /**
     * @param  list<string>  $orderedIds
     */
    public function reorderChapters(Course $course, array $orderedIds): void;

    public function createLesson(Chapter $chapter, array $data): array;

    public function updateLesson(Lesson $lesson, array $data): array;

    public function deleteLesson(Lesson $lesson): void;

    /**
     * @param  list<string>  $orderedIds
     */
    public function reorderLessons(Chapter $chapter, array $orderedIds): void;
}
