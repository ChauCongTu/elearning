<?php

namespace App\Http\Controllers\Public;

use App\Contracts\Catalog\CourseCatalogServiceInterface;
use App\Contracts\Content\SiteContentServiceInterface;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(
        private SiteContentServiceInterface $siteContent,
        private CourseCatalogServiceInterface $courses,
    ) {}

    public function about(): Response
    {
        return $this->render('public/pages/about');
    }

    public function pricing(): Response
    {
        return Inertia::render('public/pages/pricing', [
            'siteContent' => $this->siteContent->all(),
            'courses' => $this->courses->listForPricing(),
        ]);
    }

    public function contact(): Response
    {
        return $this->render('public/pages/contact');
    }

    public function info(): Response
    {
        return $this->render('public/pages/info');
    }

    private function render(string $page): Response
    {
        return Inertia::render($page, [
            'siteContent' => $this->siteContent->all(),
        ]);
    }
}
