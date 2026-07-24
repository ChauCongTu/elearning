<?php

namespace App\Services\Admin;

use App\Contracts\Admin\AdminCourseServiceInterface;
use App\Contracts\Files\FileServiceInterface;
use App\Enums\FilePrefix;
use App\Models\Course;
use App\Support\SlugGenerator;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\UploadedFile;

class AdminCourseService implements AdminCourseServiceInterface
{
    public function __construct(
        private FileServiceInterface $files,
    ) {}

    public function paginateForAdmin(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Course::query()
            ->with('category:id,name')
            ->orderByDesc('created_at');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%");
            });
        }

        if (isset($filters['is_published']) && $filters['is_published'] !== '') {
            $query->where('is_published', filter_var($filters['is_published'], FILTER_VALIDATE_BOOLEAN));
        }

        return $query->paginate($perPage)->withQueryString()->through(fn (Course $course) => $this->toListArray($course));
    }

    public function findForAdmin(string $id): array
    {
        $course = Course::query()->with('category:id,name')->findOrFail($id);

        return $this->toFormArray($course);
    }

    public function create(array $data): Course
    {
        $slug = $data['slug'] ?? SlugGenerator::unique($data['title'], Course::class);

        $course = Course::create([
            'category_id' => $data['category_id'] ?? null,
            'title' => $data['title'],
            'slug' => $slug,
            'excerpt' => $data['excerpt'] ?? null,
            'description' => $data['description'] ?? '',
            'price' => $data['price'] ?? 0,
            'compare_price' => $data['compare_price'] ?? null,
            'thumbnail_path' => $data['thumbnail_path'] ?? null,
            'instructor_name' => $data['instructor_name'] ?? null,
            'instructor_title' => $data['instructor_title'] ?? null,
            'duration_label' => $data['duration_label'] ?? null,
            'lesson_count_label' => $data['lesson_count_label'] ?? null,
            'benefits' => $data['benefits'] ?? null,
            'faq' => $data['faq'] ?? null,
            'is_featured' => $data['is_featured'] ?? false,
            'is_published' => $data['is_published'] ?? false,
            'published_at' => ($data['is_published'] ?? false) ? now() : null,
            'meta' => $data['meta'] ?? null,
            'purchase_count_offset' => $data['purchase_count_offset'] ?? 0,
            'certificate_template_type' => $data['certificate_template_type'] ?? null,
            'certificate_template' => $data['certificate_template'] ?? null,
        ]);

        return $course;
    }

    public function update(Course $course, array $data): Course
    {
        unset($data['thumbnail']);

        if (isset($data['title']) && ! isset($data['slug'])) {
            $data['slug'] = SlugGenerator::unique($data['title'], Course::class, $course->id);
        }

        if (array_key_exists('is_published', $data)) {
            $data['published_at'] = $data['is_published'] ? ($course->published_at ?? now()) : null;
        }

        $course->fill($data);
        $course->save();

        return $course->fresh();
    }

    public function delete(Course $course): void
    {
        if ($course->thumbnail_path) {
            $this->files->delete($course->thumbnail_path);
        }

        $course->delete();
    }

    public function storeThumbnail(Course $course, UploadedFile $file): Course
    {
        $path = $this->files->replace($file, FilePrefix::CourseThumbnail, $course->thumbnail_path);
        $course->update(['thumbnail_path' => $path]);

        return $course->fresh();
    }

    /**
     * @return array<string, mixed>
     */
    private function toListArray(Course $course): array
    {
        return [
            'id' => $course->id,
            'title' => $course->title,
            'slug' => $course->slug,
            'price' => (string) $course->price,
            'is_published' => $course->is_published,
            'is_featured' => $course->is_featured,
            'thumbnail_path' => $course->thumbnail_path,
            'thumbnail_url' => $course->thumbnail_url,
            'category' => $course->category ? [
                'id' => $course->category->id,
                'name' => $course->category->name,
            ] : null,
            'updated_at' => $course->updated_at?->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function toFormArray(Course $course): array
    {
        return [
            'id' => $course->id,
            'category_id' => $course->category_id,
            'title' => $course->title,
            'slug' => $course->slug,
            'excerpt' => $course->excerpt,
            'description' => $course->description,
            'price' => (string) $course->price,
            'compare_price' => $course->compare_price !== null ? (string) $course->compare_price : null,
            'thumbnail_path' => $course->thumbnail_path,
            'thumbnail_url' => $course->thumbnail_url,
            'instructor_name' => $course->instructor_name,
            'instructor_title' => $course->instructor_title,
            'duration_label' => $course->duration_label,
            'lesson_count_label' => $course->lesson_count_label,
            'benefits' => $course->benefits ?? [],
            'faq' => $course->faq ?? [],
            'is_featured' => $course->is_featured,
            'is_published' => $course->is_published,
            'published_at' => $course->published_at?->toIso8601String(),
            'certificate_template_type' => $course->certificate_template_type?->value,
            'certificate_template' => $course->certificate_template,
            'certificate_placeholders' => app(\App\Contracts\Student\CertificateTemplateRendererInterface::class)->availablePlaceholders(),
            'purchase_count_offset' => (int) ($course->purchase_count_offset ?? 0),
            'purchase_count' => $course->displayPurchaseCount(),
        ];
    }
}
