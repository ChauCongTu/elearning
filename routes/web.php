<?php

use App\Http\Controllers\Account\LoginHistoryController;
use App\Http\Controllers\Account\MyCoursesController;
use App\Http\Controllers\Account\PaymentHistoryController;
use App\Http\Controllers\Account\PurchaseHistoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Public\ConsultationController;
use App\Http\Controllers\Public\CourseController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\PageController;
use App\Http\Controllers\Public\PostController;
use Illuminate\Support\Facades\Route;

Route::middleware('site.online')->group(function () {
    Route::get('/', HomeController::class)->name('home');

    Route::post('/consultation', [ConsultationController::class, 'store'])->name('consultation.store');

    Route::get('/courses', [CourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/{slug}', [CourseController::class, 'show'])->name('courses.show');

    Route::get('/tin-tuc', [PostController::class, 'index'])->name('posts.index');
    Route::get('/tin-tuc/danh-muc/{category}', [PostController::class, 'category'])->name('posts.category');
    Route::get('/tin-tuc/{slug}', [PostController::class, 'show'])->name('posts.show');

    Route::get('/bang-gia', [PageController::class, 'pricing'])->name('pages.pricing');
    Route::get('/ve-chung-toi', [PageController::class, 'about'])->name('pages.about');
    Route::get('/lien-he', [PageController::class, 'contact'])->name('pages.contact');
    Route::get('/thong-tin', [PageController::class, 'info'])->name('pages.info');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('dashboard', '/account/courses')->name('dashboard');

    Route::prefix('account')->name('account.')->group(function () {
        Route::redirect('/', '/account/courses');
        Route::get('/courses', MyCoursesController::class)->name('courses');
        Route::get('/purchases', PurchaseHistoryController::class)->name('purchases');
        Route::get('/payments', PaymentHistoryController::class)->name('payments');
        Route::get('/login-history', LoginHistoryController::class)->name('login-history');
    });
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');
});

require __DIR__.'/settings.php';
