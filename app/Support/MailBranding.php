<?php

namespace App\Support;

final class MailBranding
{
    /**
     * @return array<string, mixed>
     */
    public static function viewData(): array
    {
        $site = config('site.site', []);
        $theme = config('site.theme', []);
        $contact = config('site.contact', []);

        return [
            'branding' => [
                'siteName' => (string) ($site['name'] ?? config('app.name')),
                'shortName' => (string) ($site['short_name'] ?? config('app.name')),
                'tagline' => (string) ($site['tagline'] ?? ''),
                'logoUrl' => self::logoUrl(),
                'logoAlt' => (string) ($site['logo_alt'] ?? config('app.name')),
                'primary' => (string) ($theme['primary'] ?? '#e64980'),
                'primaryDark' => (string) ($theme['primary_dark'] ?? '#c2255c'),
                'primaryLight' => (string) ($theme['primary_light'] ?? '#fff0f6'),
                'secondary' => (string) ($theme['secondary'] ?? '#be4bdb'),
                'surface' => (string) ($theme['surface'] ?? '#fff5f8'),
                'hotline' => (string) ($contact['primary_hotline'] ?? ''),
                'appUrl' => config('app.url'),
            ],
        ];
    }

    public static function siteName(): string
    {
        return (string) (config('site.site.name') ?? config('app.name'));
    }

    public static function logoUrl(): string
    {
        $logo = (string) (config('site.site.logo_url') ?? '');

        if ($logo === '') {
            return url('/favicon.ico');
        }

        if (str_starts_with($logo, 'http://') || str_starts_with($logo, 'https://')) {
            return $logo;
        }

        return url($logo);
    }

    public static function inlineStyles(): string
    {
        $primary = (string) (config('site.theme.primary') ?? '#e64980');
        $primaryDark = (string) (config('site.theme.primary_dark') ?? '#c2255c');
        $primaryLight = (string) (config('site.theme.primary_light') ?? '#fff0f6');
        $secondary = (string) (config('site.theme.secondary') ?? '#be4bdb');

        return <<<CSS
body {
    background-color: {$primaryLight} !important;
}

.wrapper {
    background-color: {$primaryLight} !important;
}

.header {
    background: linear-gradient(135deg, {$primary} 0%, {$secondary} 100%) !important;
    border-bottom: 0 !important;
    padding: 28px 0 !important;
}

.header a {
    color: #ffffff !important;
}

.logo {
    height: auto !important;
    max-height: 64px !important;
    width: auto !important;
    max-width: 220px !important;
    margin: 0 auto !important;
}

.inner-body {
    background-color: #ffffff !important;
    border: 1px solid #f3d4e3 !important;
    border-radius: 12px !important;
}

.content-cell {
    padding: 32px !important;
}

.content-cell h1 {
    color: {$primaryDark} !important;
}

.content-cell a:not(.button) {
    color: {$primary} !important;
}

.button-primary,
.button-blue {
    background-color: {$primary} !important;
    border-color: {$primary} !important;
}

.button-primary:hover,
.button-blue:hover {
    background-color: {$primaryDark} !important;
    border-color: {$primaryDark} !important;
}

.footer {
    color: #71717a !important;
}

.footer a {
    color: {$primary} !important;
}
CSS;
    }
}
