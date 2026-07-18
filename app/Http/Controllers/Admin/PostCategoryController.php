<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Admin\AdminPostCategoryServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\PostCategory;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PostCategoryController extends Controller
{
    public function __construct(
        private AdminPostCategoryServiceInterface $categories,
    ) {}

    public function index(): Response
    {
        return Inertia::render('admin/post-categories/index', [
            'categories' => $this->categories->listForAdmin(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $this->categories->create($data);

        return back()->with('success', 'Đã thêm danh mục tin.');
    }

    public function update(Request $request, PostCategory $postCategory): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $this->categories->update($postCategory, $data);

        return back()->with('success', 'Đã cập nhật danh mục tin.');
    }

    public function toggle(Request $request, PostCategory $postCategory): RedirectResponse
    {
        $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $this->categories->update($postCategory, [
            'is_active' => $request->boolean('is_active'),
        ]);

        return back();
    }

    public function destroy(PostCategory $postCategory): RedirectResponse
    {
        $this->categories->delete($postCategory);

        return back()->with('success', 'Đã xóa danh mục tin.');
    }
}
