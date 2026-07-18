<?php

namespace App\Http\Controllers\Admin;

use App\Contracts\Files\FileServiceInterface;
use App\Enums\FilePrefix;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EditorUploadController extends Controller
{
    public function __construct(
        private FileServiceInterface $files,
    ) {}

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:5120'],
        ], [
            'image.required' => 'Vui lòng chọn ảnh.',
            'image.image' => 'File phải là ảnh.',
        ]);

        $path = $this->files->upload($request->file('image'), FilePrefix::EditorImage);

        return response()->json([
            'url' => $this->files->url($path),
        ]);
    }
}
