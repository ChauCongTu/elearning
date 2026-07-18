<?php

use App\Http\Controllers\Account\LoginHistoryController;
use App\Http\Controllers\Account\MyCoursesController;
use App\Http\Controllers\Account\PaymentHistoryController;
use App\Http\Controllers\Account\PurchaseHistoryController;
use App\Http\Controllers\Account\CourseReviewController as AccountCourseReviewController;
use App\Http\Controllers\Admin\BannerController;
use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\CourseController as AdminCourseController;
use App\Http\Controllers\Admin\CourseReviewController as AdminCourseReviewController;
use App\Http\Controllers\Admin\CurriculumController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\EditorUploadController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\PostCategoryController;
use App\Http\Controllers\Admin\PostController as AdminPostController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Learn\LearningController;
use App\Http\Controllers\Learn\ProgressController;
use App\Http\Controllers\Public\ConsultationController;
use App\Http\Controllers\Public\CourseController as PublicCourseController;
use App\Http\Controllers\Public\HomeController;
use App\Http\Controllers\Public\PageController;
use App\Http\Controllers\Public\PostController as PublicPostController;
use Illuminate\Support\Facades\Route;

Route::middleware('site.online')->group(function () {
    Route::get('/', HomeController::class)->name('home');

    Route::post('/consultation', [ConsultationController::class, 'store'])->name('consultation.store');

    Route::get('/courses', [PublicCourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/{slug}', [PublicCourseController::class, 'show'])->name('courses.show');

    Route::get('/tin-tuc', [PublicPostController::class, 'index'])->name('posts.index');
    Route::get('/tin-tuc/danh-muc/{category}', [PublicPostController::class, 'category'])->name('posts.category');
    Route::get('/tin-tuc/{slug}', [PublicPostController::class, 'show'])->name('posts.show');

    Route::get('/bang-gia', [PageController::class, 'pricing'])->name('pages.pricing');
    Route::get('/ve-chung-toi', [PageController::class, 'about'])->name('pages.about');
    Route::get('/lien-he', [PageController::class, 'contact'])->name('pages.contact');
    Route::get('/thong-tin', [PageController::class, 'info'])->name('pages.info');

    Route::get('/learn/{course}/lessons/{lesson}', [LearningController::class, 'show'])
        ->name('learn.lessons.show');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('dashboard', '/account/courses')->name('dashboard');

    Route::get('/learn/{course}', [LearningController::class, 'redirect'])->name('learn.show');
    Route::patch('/learn/progress', [ProgressController::class, 'update'])->name('learn.progress.update');

    Route::prefix('account')->name('account.')->group(function () {
        Route::redirect('/', '/account/courses');
        Route::get('/courses', MyCoursesController::class)->name('courses');
        Route::get('/purchases', PurchaseHistoryController::class)->name('purchases');
        Route::get('/payments', PaymentHistoryController::class)->name('payments');
        Route::get('/login-history', LoginHistoryController::class)->name('login-history');
        Route::post('/courses/{slug}/reviews', [AccountCourseReviewController::class, 'store'])
            ->name('courses.reviews.store');
    });
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', DashboardController::class)->name('dashboard');
    Route::post('/uploads/editor-image', [EditorUploadController::class, 'store'])->name('uploads.editor-image');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::get('/users/{user}', [UserController::class, 'show'])->name('users.show');
    Route::patch('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::post('/users/{user}/enrollments', [UserController::class, 'grantEnrollment'])->name('users.enrollments.store');

    Route::get('/categories', [CategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::patch('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::patch('/categories/{category}/toggle', [CategoryController::class, 'toggle'])->name('categories.toggle');
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/courses', [AdminCourseController::class, 'index'])->name('courses.index');
    Route::get('/courses/create', [AdminCourseController::class, 'create'])->name('courses.create');
    Route::post('/courses', [AdminCourseController::class, 'store'])->name('courses.store');
    Route::get('/courses/{course}/edit', [AdminCourseController::class, 'edit'])->name('courses.edit');
    Route::patch('/courses/{course}', [AdminCourseController::class, 'update'])->name('courses.update');
    Route::patch('/courses/{course}/toggle', [AdminCourseController::class, 'toggle'])->name('courses.toggle');
    Route::delete('/courses/{course}', [AdminCourseController::class, 'destroy'])->name('courses.destroy');
    Route::get('/courses/{course}/curriculum', [CurriculumController::class, 'index'])->name('courses.curriculum');
    Route::post('/courses/{course}/chapters', [CurriculumController::class, 'storeChapter'])->name('courses.chapters.store');
    Route::patch('/chapters/{chapter}', [CurriculumController::class, 'updateChapter'])->name('chapters.update');
    Route::delete('/chapters/{chapter}', [CurriculumController::class, 'destroyChapter'])->name('chapters.destroy');
    Route::post('/courses/{course}/chapters/reorder', [CurriculumController::class, 'reorderChapters'])->name('courses.chapters.reorder');
    Route::post('/chapters/{chapter}/lessons', [CurriculumController::class, 'storeLesson'])->name('chapters.lessons.store');
    Route::patch('/lessons/{lesson}', [CurriculumController::class, 'updateLesson'])->name('lessons.update');
    Route::delete('/lessons/{lesson}', [CurriculumController::class, 'destroyLesson'])->name('lessons.destroy');
    Route::post('/chapters/{chapter}/lessons/reorder', [CurriculumController::class, 'reorderLessons'])->name('chapters.lessons.reorder');
    Route::post('/lessons/{lesson}/upload-url', [CurriculumController::class, 'uploadUrl'])->name('lessons.upload-url');
    Route::post('/lessons/{lesson}/confirm-video', [CurriculumController::class, 'confirmVideo'])->name('lessons.confirm-video');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');

    Route::get('/banners', [BannerController::class, 'index'])->name('banners.index');
    Route::post('/banners', [BannerController::class, 'store'])->name('banners.store');
    Route::patch('/banners/{banner}', [BannerController::class, 'update'])->name('banners.update');
    Route::patch('/banners/{banner}/toggle', [BannerController::class, 'toggle'])->name('banners.toggle');
    Route::delete('/banners/{banner}', [BannerController::class, 'destroy'])->name('banners.destroy');

    Route::get('/posts', [AdminPostController::class, 'index'])->name('posts.index');
    Route::get('/posts/create', [AdminPostController::class, 'create'])->name('posts.create');
    Route::post('/posts', [AdminPostController::class, 'store'])->name('posts.store');
    Route::get('/posts/{post}/edit', [AdminPostController::class, 'edit'])->name('posts.edit');
    Route::patch('/posts/{post}', [AdminPostController::class, 'update'])->name('posts.update');
    Route::patch('/posts/{post}/toggle', [AdminPostController::class, 'toggle'])->name('posts.toggle');
    Route::delete('/posts/{post}', [AdminPostController::class, 'destroy'])->name('posts.destroy');

    Route::get('/post-categories', [PostCategoryController::class, 'index'])->name('post-categories.index');
    Route::post('/post-categories', [PostCategoryController::class, 'store'])->name('post-categories.store');
    Route::patch('/post-categories/{postCategory}', [PostCategoryController::class, 'update'])->name('post-categories.update');
    Route::patch('/post-categories/{postCategory}/toggle', [PostCategoryController::class, 'toggle'])->name('post-categories.toggle');
    Route::delete('/post-categories/{postCategory}', [PostCategoryController::class, 'destroy'])->name('post-categories.destroy');

    Route::get('/reviews', [AdminCourseReviewController::class, 'index'])->name('reviews.index');
    Route::patch('/reviews/{review}', [AdminCourseReviewController::class, 'update'])->name('reviews.update');
});

require __DIR__.'/settings.php';
