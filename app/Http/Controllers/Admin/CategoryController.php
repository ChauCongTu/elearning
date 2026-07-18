<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Admin\AdminCategoryServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function __construct(
        private AdminCategoryServiceInterface $categories,
    ) {}

    public function index(): Response
    {
        return Inertia::render('admin/categories/index', [
            'categories' => $this->categories->listForAdmin(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'uuid', 'exists:categories,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'Vui lòng nhập tên danh mục.',
        ]);

        $this->categories->create($data);

        return back()->with('success', 'Đã thêm danh mục.');
    }

    public function update(Request $request, Category $category): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'uuid', 'exists:categories,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $this->categories->update($category, $data);

        return back()->with('success', 'Đã cập nhật danh mục.');
    }

    public function toggle(Request $request, Category $category): RedirectResponse
    {
        $data = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $this->categories->update($category, [
            'is_active' => $request->boolean('is_active'),
        ]);

        return back();
    }

    public function destroy(Category $category): RedirectResponse
    {
        $this->categories->delete($category);

        return back()->with('success', 'Đã xóa danh mục.');
    }
}
