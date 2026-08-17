<?php

namespace App\Services\Content;

use App\Contracts\Content\SitemapServiceInterface;
use App\Models\Course;
use App\Models\Post;
use App\Models\PostCategory;

class SitemapService implements SitemapServiceInterface
{
    public function render(): string
    {
        $entries = array_merge(
            $this->staticPages(),
            $this->coursePages(),
            $this->postListingPages(),
            $this->postPages(),
        );

        return $this->toXml($entries);
    }

    /**
     * @return list<array{loc: string, lastmod?: string, changefreq: string, priority: string}>
     */
    private function staticPages(): array
    {
        return [
            $this->entry(route('home'), changefreq: 'weekly', priority: '1.0'),
            $this->entry(route('courses.index'), changefreq: 'weekly', priority: '0.9'),
            $this->entry(route('posts.index'), changefreq: 'daily', priority: '0.8'),
            $this->entry(route('pages.pricing'), changefreq: 'monthly', priority: '0.6'),
            $this->entry(route('pages.about'), changefreq: 'monthly', priority: '0.6'),
            $this->entry(route('pages.contact'), changefreq: 'monthly', priority: '0.5'),
            $this->entry(route('pages.info'), changefreq: 'monthly', priority: '0.4'),
        ];
    }

    /**
     * @return list<array{loc: string, lastmod?: string, changefreq: string, priority: string}>
     */
    private function coursePages(): array
    {
        return Course::query()
            ->published()
            ->orderBy('updated_at', 'desc')
            ->get(['slug', 'updated_at'])
            ->map(fn (Course $course) => $this->entry(
                route('courses.show', $course->slug),
                lastmod: $course->updated_at?->toAtomString(),
                changefreq: 'weekly',
                priority: '0.8',
            ))
            ->all();
    }

    /**
     * @return list<array{loc: string, lastmod?: string, changefreq: string, priority: string}>
     */
    private function postListingPages(): array
    {
        return PostCategory::query()
            ->active()
            ->get(['slug', 'updated_at'])
            ->map(fn (PostCategory $category) => $this->entry(
                route('posts.category', $category->slug),
                lastmod: $category->updated_at?->toAtomString(),
                changefreq: 'weekly',
                priority: '0.6',
            ))
            ->all();
    }

    /**
     * @return list<array{loc: string, lastmod?: string, changefreq: string, priority: string}>
     */
    private function postPages(): array
    {
        return Post::query()
            ->published()
            ->orderBy('updated_at', 'desc')
            ->get(['slug', 'updated_at'])
            ->map(fn (Post $post) => $this->entry(
                route('posts.show', $post->slug),
                lastmod: $post->updated_at?->toAtomString(),
                changefreq: 'monthly',
                priority: '0.7',
            ))
            ->all();
    }

    /**
     * @param  list<array{loc: string, lastmod?: string, changefreq: string, priority: string}>  $entries
     */
    private function toXml(array $entries): string
    {
        $urls = '';

        foreach ($entries as $entry) {
            $urls .= '  <url>'."\n";
            $urls .= '    <loc>'.htmlspecialchars($entry['loc'], ENT_XML1).'</loc>'."\n";

            if (! empty($entry['lastmod'])) {
                $urls .= '    <lastmod>'.htmlspecialchars($entry['lastmod'], ENT_XML1).'</lastmod>'."\n";
            }

            $urls .= '    <changefreq>'.$entry['changefreq'].'</changefreq>'."\n";
            $urls .= '    <priority>'.$entry['priority'].'</priority>'."\n";
            $urls .= '  </url>'."\n";
        }

        return '<?xml version="1.0" encoding="UTF-8"?>'."\n"
            .'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n"
            .$urls
            .'</urlset>'."\n";
    }

    /**
     * @return array{loc: string, lastmod?: string, changefreq: string, priority: string}
     */
    private function entry(
        string $loc,
        ?string $lastmod = null,
        string $changefreq = 'weekly',
        string $priority = '0.5',
    ): array {
        if (! str_starts_with($loc, 'http')) {
            $loc = rtrim((string) config('app.url'), '/').'/'.ltrim($loc, '/');
        }

        $entry = [
            'loc' => $loc,
            'changefreq' => $changefreq,
            'priority' => $priority,
        ];

        if ($lastmod !== null) {
            $entry['lastmod'] = $lastmod;
        }

        return $entry;
    }
}
