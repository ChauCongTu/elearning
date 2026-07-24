<?php

use App\Http\Controllers\Api\StudentSearchApiController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:30,1')->group(function () {
    Route::get('/v1/students/search', StudentSearchApiController::class)
        ->name('api.students.search');
});
