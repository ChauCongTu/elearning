<?php

namespace App\Providers;

use App\Contracts\Admin\AdminDashboardServiceInterface;
use App\Contracts\Catalog\CategoryServiceInterface;
use App\Contracts\Catalog\CourseCatalogServiceInterface;
use App\Contracts\Consultation\ConsultationServiceInterface;
use App\Contracts\Content\BannerServiceInterface;
use App\Contracts\Content\HomePageServiceInterface;
use App\Contracts\Content\PostCategoryServiceInterface;
use App\Contracts\Content\PostServiceInterface;
use App\Contracts\Content\SiteContentServiceInterface;
use App\Contracts\Content\SiteSettingsServiceInterface;
use App\Services\Content\SiteSettingsService;
use App\Services\Admin\AdminDashboardService;
use App\Services\Catalog\CategoryService;
use App\Services\Catalog\CourseCatalogService;
use App\Services\Consultation\ConsultationService;
use App\Services\Content\BannerService;
use App\Services\Content\HomePageService;
use App\Services\Content\PostCategoryService;
use App\Services\Content\PostService;
use App\Services\Content\SiteContentService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->bind(SiteSettingsServiceInterface::class, SiteSettingsService::class);
        $this->app->bind(SiteContentServiceInterface::class, SiteContentService::class);
        $this->app->bind(CategoryServiceInterface::class, CategoryService::class);
        $this->app->bind(CourseCatalogServiceInterface::class, CourseCatalogService::class);
        $this->app->bind(BannerServiceInterface::class, BannerService::class);
        $this->app->bind(HomePageServiceInterface::class, HomePageService::class);
        $this->app->bind(ConsultationServiceInterface::class, ConsultationService::class);
        $this->app->bind(AdminDashboardServiceInterface::class, AdminDashboardService::class);
        $this->app->bind(PostCategoryServiceInterface::class, PostCategoryService::class);
        $this->app->bind(PostServiceInterface::class, PostService::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
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
