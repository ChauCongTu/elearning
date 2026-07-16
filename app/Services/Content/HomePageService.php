<?php

namespace App\Services\Content;

use App\Contracts\Catalog\CategoryServiceInterface;
use App\Contracts\Catalog\CourseCatalogServiceInterface;
use App\Contracts\Content\BannerServiceInterface;
use App\Contracts\Content\HomePageServiceInterface;
use App\Contracts\Content\PostServiceInterface;
use App\Contracts\Content\SiteContentServiceInterface;

class HomePageService implements HomePageServiceInterface
{
    public function __construct(
        private BannerServiceInterface $banners,
        private CourseCatalogServiceInterface $courses,
        private CategoryServiceInterface $categories,
        private SiteContentServiceInterface $siteContent,
        private PostServiceInterface $posts,
    ) {}

    public function getData(): array
    {
        return [
            'banners' => $this->banners->listActive(),
            'enrollmentCourses' => $this->courses->listEnrollmentCourses(),
            'featuredCourses' => $this->courses->listFeaturedCourses(),
            'latestCourses' => $this->courses->listLatestCourses(),
            'categories' => $this->categories->listActive(),
            'siteContent' => $this->siteContent->all(),
            'articleSections' => $this->posts->listHomeSections(),
        ];
    }
}
