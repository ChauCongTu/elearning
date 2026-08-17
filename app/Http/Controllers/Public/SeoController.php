<?php

namespace App\Http\Controllers\Public;

use App\Contracts\Content\SitemapServiceInterface;
use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function sitemap(SitemapServiceInterface $sitemap): Response
    {
        return response($sitemap->render(), 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    public function robots(): Response
    {
        $sitemapUrl = rtrim((string) config('app.url'), '/').'/sitemap.xml';

        $body = implode("\n", [
            'User-agent: *',
            'Disallow:',
            '',
            'Sitemap: '.$sitemapUrl,
            '',
        ]);

        return response($body, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ]);
    }
}
