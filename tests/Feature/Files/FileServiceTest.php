<?php

use App\Contracts\Files\FileServiceInterface;
use App\Enums\FilePrefix;
use App\Services\Files\FileService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    config(['filesystems.upload_disk' => 'public']);
});

test('file service uploads to prefixed directory on public disk', function () {
    Storage::fake('public');

    $service = app(FileServiceInterface::class);
    $file = UploadedFile::fake()->image('avatar.jpg');

    $path = $service->upload($file, FilePrefix::Avatar);

    expect($path)->toStartWith('avatars/')
        ->and($service->exists($path))->toBeTrue()
        ->and($service->url($path))->toContain('/storage/avatars/');
});

test('file service replace deletes previous managed file', function () {
    Storage::fake('public');

    $service = app(FileServiceInterface::class);
    $first = $service->upload(UploadedFile::fake()->image('one.jpg'), FilePrefix::Avatar);
    $second = $service->replace(
        UploadedFile::fake()->image('two.jpg'),
        FilePrefix::Avatar,
        $first,
    );

    expect($service->exists($first))->toBeFalse()
        ->and($service->exists($second))->toBeTrue();
});

test('file service does not delete public demo image paths', function () {
    Storage::fake('public');

    $service = app(FileServiceInterface::class);

    expect($service->delete('images/courses/demo.svg'))->toBeFalse()
        ->and($service->url('images/courses/demo.svg'))->toContain('/images/courses/demo.svg');
});

test('file service uses configured upload disk', function () {
    expect(app(FileServiceInterface::class))->toBeInstanceOf(FileService::class)
        ->and(app(FileServiceInterface::class)->disk())->toBe('public');
});

test('file service uploads lesson video to s3 without creating directory placeholder', function () {
    Storage::fake('s3');
    config([
        'filesystems.upload_disk' => 's3',
        'filesystems.disks.s3.options' => ['ACL' => ''],
    ]);

    $service = app(FileServiceInterface::class);
    $path = $service->upload(
        UploadedFile::fake()->create('lesson.mp4', 100, 'video/mp4'),
        FilePrefix::LessonVideo,
    );

    expect($path)->toStartWith('lessons/videos/')
        ->and(Storage::disk('s3')->exists($path))->toBeTrue();
});
