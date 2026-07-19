<?php

namespace App\Providers;

use App\Contracts\Files\FileServiceInterface;
use App\Contracts\Learning\EnrollmentProgressServiceInterface;
use App\Contracts\Learning\LearningServiceInterface;
use App\Contracts\Payment\OrderServiceInterface;
use App\Contracts\Payment\SePayServiceInterface;
use App\Contracts\Payment\SePayWebhookKeyServiceInterface;
use App\Contracts\Video\VideoStreamServiceInterface;
use App\Contracts\Enrollment\EnrollmentServiceInterface;
use App\Contracts\Admin\AdminDashboardServiceInterface;
use App\Contracts\Admin\AdminBannerServiceInterface;
use App\Contracts\Admin\AdminCategoryServiceInterface;
use App\Contracts\Admin\AdminCourseServiceInterface;
use App\Contracts\Admin\AdminCurriculumServiceInterface;
use App\Contracts\Admin\AdminOrderServiceInterface;
use App\Contracts\Admin\AdminPostCategoryServiceInterface;
use App\Contracts\Admin\AdminPostServiceInterface;
use App\Contracts\Admin\AdminUserServiceInterface;
use App\Contracts\Catalog\CategoryServiceInterface;
use App\Contracts\Catalog\CourseCatalogServiceInterface;
use App\Contracts\Catalog\CourseReviewServiceInterface;
use App\Contracts\Consultation\ConsultationServiceInterface;
use App\Contracts\Content\BannerServiceInterface;
use App\Contracts\Content\HomePageServiceInterface;
use App\Contracts\Content\PostCategoryServiceInterface;
use App\Contracts\Content\PostServiceInterface;
use App\Contracts\Content\SiteContentServiceInterface;
use App\Contracts\Content\SiteSettingsServiceInterface;
use App\Services\Files\FileService;
use App\Services\Content\SiteSettingsService;
use App\Services\Admin\AdminDashboardService;
use App\Services\Admin\AdminBannerService;
use App\Services\Admin\AdminCategoryService;
use App\Services\Admin\AdminCourseService;
use App\Services\Admin\AdminCurriculumService;
use App\Services\Admin\AdminOrderService;
use App\Services\Admin\AdminPostCategoryService;
use App\Services\Admin\AdminPostService;
use App\Services\Admin\AdminUserService;
use App\Services\Catalog\CategoryService;
use App\Services\Catalog\CourseCatalogService;
use App\Services\Catalog\CourseReviewService;
use App\Services\Consultation\ConsultationService;
use App\Services\Content\BannerService;
use App\Services\Content\HomePageService;
use App\Services\Content\PostCategoryService;
use App\Services\Content\PostService;
use App\Services\Content\SiteContentService;
use App\Listeners\RecordUserLogin;
use App\Services\Enrollment\EnrollmentService;
use App\Services\Learning\EnrollmentProgressService;
use App\Services\Learning\LearningService;
use App\Services\Payment\OrderService;
use App\Services\Payment\SePayService;
use App\Services\Payment\SePayWebhookKeyService;
use App\Services\Video\VideoStreamService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Auth\Events\Login;
use Illuminate\Support\ServiceProvider;

use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(FileServiceInterface::class, FileService::class);
        $this->app->bind(SiteSettingsServiceInterface::class, SiteSettingsService::class);
        $this->app->bind(SiteContentServiceInterface::class, SiteContentService::class);
        $this->app->bind(CategoryServiceInterface::class, CategoryService::class);
        $this->app->bind(CourseCatalogServiceInterface::class, CourseCatalogService::class);
        $this->app->bind(CourseReviewServiceInterface::class, CourseReviewService::class);
        $this->app->bind(BannerServiceInterface::class, BannerService::class);
        $this->app->bind(HomePageServiceInterface::class, HomePageService::class);
        $this->app->bind(ConsultationServiceInterface::class, ConsultationService::class);
        $this->app->bind(AdminDashboardServiceInterface::class, AdminDashboardService::class);
        $this->app->bind(AdminCategoryServiceInterface::class, AdminCategoryService::class);
        $this->app->bind(AdminCourseServiceInterface::class, AdminCourseService::class);
        $this->app->bind(AdminCurriculumServiceInterface::class, AdminCurriculumService::class);
        $this->app->bind(AdminUserServiceInterface::class, AdminUserService::class);
        $this->app->bind(AdminOrderServiceInterface::class, AdminOrderService::class);
        $this->app->bind(AdminBannerServiceInterface::class, AdminBannerService::class);
        $this->app->bind(AdminPostCategoryServiceInterface::class, AdminPostCategoryService::class);
        $this->app->bind(AdminPostServiceInterface::class, AdminPostService::class);
        $this->app->bind(PostCategoryServiceInterface::class, PostCategoryService::class);
        $this->app->bind(EnrollmentServiceInterface::class, EnrollmentService::class);
        $this->app->bind(LearningServiceInterface::class, LearningService::class);
        $this->app->bind(EnrollmentProgressServiceInterface::class, EnrollmentProgressService::class);
        $this->app->bind(VideoStreamServiceInterface::class, VideoStreamService::class);
        $this->app->bind(OrderServiceInterface::class, OrderService::class);
        $this->app->bind(SePayWebhookKeyServiceInterface::class, SePayWebhookKeyService::class);
        $this->app->bind(SePayServiceInterface::class, SePayService::class);
        $this->app->bind(PostServiceInterface::class, PostService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(Login::class, RecordUserLogin::class);

        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
