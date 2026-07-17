<?php

use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    if (app()->environment('local')) {
        Route::get('settings/profile/upload-check', function () {
            $tmpDir = storage_path('framework/tmp');

            return response()->json([
                'upload_tmp_dir' => ini_get('upload_tmp_dir') ?: null,
                'sys_temp_dir' => sys_get_temp_dir(),
                'file_uploads' => ini_get('file_uploads'),
                'upload_max_filesize' => ini_get('upload_max_filesize'),
                'post_max_size' => ini_get('post_max_size'),
                'project_tmp_dir' => $tmpDir,
                'project_tmp_writable' => is_dir($tmpDir) && is_writable($tmpDir),
                'loaded_ini' => php_ini_loaded_file(),
            ]);
        })->name('profile.upload-check');
    }
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::redirect('settings/appearance', '/settings/profile')->name('appearance.edit');
});
