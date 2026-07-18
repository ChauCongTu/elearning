<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Admin\AdminBannerServiceInterface;
use App\Http\Controllers\Admin\Concerns\NormalizesAdminFormInput;
use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Services\Admin\AdminBannerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BannerController extends Controller
{
    use NormalizesAdminFormInput;

    public function __construct(
        private AdminBannerServiceInterface $banners,
    ) {}

    public function index(): Response
    {
        return Inertia::render('admin/banners/index', [
            'banners' => $this->banners->listForAdmin(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->normalizeNullable($request, ['link_url', 'starts_at', 'ends_at']);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'link_url' => ['nullable', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'image' => ['required', 'image', 'max:5120'],
        ]);

        $service = app(AdminBannerService::class);

        $imagePath = app(\App\Contracts\Files\FileServiceInterface::class)
            ->upload($request->file('image'), \App\Enums\FilePrefix::Banner);

        $data['image_path'] = $imagePath;
        $data['is_active'] = $request->boolean('is_active', true);
        $service->create($data);

        return back()->with('success', 'Đã thêm banner.');
    }

    public function update(Request $request, Banner $banner): RedirectResponse
    {
        $this->normalizeNullable($request, ['link_url', 'starts_at', 'ends_at']);

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'link_url' => ['nullable', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'image' => ['nullable', 'image', 'max:5120'],
        ]);

        $service = app(AdminBannerService::class);
        $data['is_active'] = $request->boolean('is_active', $banner->is_active);
        $service->update($banner, $data);

        if ($request->hasFile('image')) {
            $service->storeImage($banner, $request->file('image'));
        }

        return back()->with('success', 'Đã cập nhật banner.');
    }

    public function toggle(Request $request, Banner $banner): RedirectResponse
    {
        $data = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        app(AdminBannerService::class)->update($banner, [
            'is_active' => $data['is_active'],
        ]);

        return back();
    }

    public function destroy(Banner $banner): RedirectResponse
    {
        $this->banners->delete($banner);

        return back()->with('success', 'Đã xóa banner.');
    }
}
