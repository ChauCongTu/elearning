<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Admin\AdminCategoryServiceInterface;
use App\Contracts\Admin\AdminCourseServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Services\Admin\AdminCourseService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CourseController extends Controller
{
    public function __construct(
        private AdminCourseServiceInterface $courses,
        private AdminCategoryServiceInterface $categories,
    ) {}

    public function index(Request $request): Response
    {
        return Inertia::render('admin/courses/index', [
            'courses' => $this->courses->paginateForAdmin($request->only(['search', 'is_published'])),
            'filters' => $request->only(['search', 'is_published']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/courses/form', [
            'course' => null,
            'categories' => $this->categories->listForAdmin(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validatedCourse($request);
        $data['faq'] = $this->normalizeFaq($data['faq'] ?? null);
        $service = $this->courseService();

        $course = $service->create($data);

        if ($request->hasFile('thumbnail')) {
            $service->storeThumbnail($course, $request->file('thumbnail'));
        }

        return redirect()
            ->route('admin.courses.edit', $course)
            ->with('success', 'Đã tạo khóa học.');
    }

    public function edit(Course $course): Response
    {
        return Inertia::render('admin/courses/form', [
            'course' => $this->courses->findForAdmin($course->id),
            'categories' => $this->categories->listForAdmin(),
        ]);
    }

    public function update(Request $request, Course $course): RedirectResponse
    {
        $data = $this->validatedCourse($request, $course);
        unset($data['thumbnail']);
        $data['faq'] = $this->normalizeFaq($data['faq'] ?? null);
        $service = $this->courseService();

        $service->update($course, $data);

        if ($request->hasFile('thumbnail')) {
            $service->storeThumbnail($course, $request->file('thumbnail'));
        }

        return back()->with('success', 'Đã cập nhật khóa học.');
    }

    public function toggle(Request $request, Course $course): RedirectResponse
    {
        $data = $request->validate([
            'is_published' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
        ]);

        $payload = [];
        if (array_key_exists('is_published', $data)) {
            $payload['is_published'] = $request->boolean('is_published');
            $payload['published_at'] = $request->boolean('is_published') ? ($course->published_at ?? now()) : null;
        }
        if (array_key_exists('is_featured', $data)) {
            $payload['is_featured'] = $request->boolean('is_featured');
        }

        $this->courses->update($course, $payload);

        return back();
    }

    public function destroy(Course $course): RedirectResponse
    {
        $this->courses->delete($course);

        return redirect()
            ->route('admin.courses.index')
            ->with('success', 'Đã xóa khóa học.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedCourse(Request $request, ?Course $course = null): array
    {
        $data = $request->validate([
            'category_id' => ['nullable', 'uuid', 'exists:categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'excerpt' => ['nullable', 'string', 'max:1000'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'compare_price' => ['nullable', 'numeric', 'min:0'],
            'instructor_name' => ['nullable', 'string', 'max:255'],
            'instructor_title' => ['nullable', 'string', 'max:255'],
            'duration_label' => ['nullable', 'string', 'max:100'],
            'lesson_count_label' => ['nullable', 'string', 'max:100'],
            'benefits' => ['nullable', 'array'],
            'benefits.*' => ['string', 'max:500'],
            'faq' => ['nullable', 'array'],
            'faq.*.q' => ['required_with:faq', 'string', 'max:500'],
            'faq.*.a' => ['required_with:faq', 'string'],
            'is_featured' => ['nullable', 'boolean'],
            'is_published' => ['nullable', 'boolean'],
            'thumbnail' => ['nullable', 'image', 'max:5120'],
        ], [
            'title.required' => 'Vui lòng nhập tên khóa học.',
            'price.required' => 'Vui lòng nhập giá khóa học.',
        ]);

        if ($request->has('benefits') && is_string($request->input('benefits'))) {
            $data['benefits'] = array_values(array_filter(
                array_map('trim', explode("\n", $request->input('benefits')))
            ));
        }

        return $data;
    }

    /**
     * @param  array<int, array{q?: string, a?: string}>|null  $faq
     * @return array<int, array{q: string, a: string}>|null
     */
    private function normalizeFaq(?array $faq): ?array
    {
        if ($faq === null) {
            return null;
        }

        $normalized = [];

        foreach ($faq as $item) {
            $question = trim((string) ($item['q'] ?? ''));
            $answer = trim((string) ($item['a'] ?? ''));

            if ($question === '' && $answer === '') {
                continue;
            }

            $normalized[] = [
                'q' => $question,
                'a' => $answer,
            ];
        }

        return $normalized === [] ? null : $normalized;
    }

    private function courseService(): AdminCourseService
    {
        return app(AdminCourseService::class);
    }
}
