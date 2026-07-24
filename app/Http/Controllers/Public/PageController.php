<?php

namespace App\Http\Controllers\Public;

use App\Contracts\Catalog\CourseCatalogServiceInterface;
use App\Contracts\Content\SiteContentServiceInterface;
use App\Contracts\Student\StudentLookupServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function __construct(
        private SiteContentServiceInterface $siteContent,
        private CourseCatalogServiceInterface $courses,
        private StudentLookupServiceInterface $studentLookup,
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

    public function info(Request $request): Response
    {
        $keyword = trim((string) $request->query('q', ''));
        $results = $keyword !== ''
            ? $this->studentLookup->searchPublic($keyword)->values()->all()
            : [];

        return Inertia::render('public/pages/info', [
            'siteContent' => $this->siteContent->all(),
            'lookupQuery' => $keyword,
            'lookupResults' => $results,
        ]);
    }

    private function render(string $page): Response
    {
        return Inertia::render($page, [
            'siteContent' => $this->siteContent->all(),
        ]);
    }
}
