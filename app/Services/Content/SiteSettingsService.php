<?php

namespace App\Services\Content;

use App\Contracts\Content\SiteSettingsServiceInterface;

class SiteSettingsService implements SiteSettingsServiceInterface
{
    /**
     * @return array<string, mixed>
     */
    private function config(): array
    {
        return config('site');
    }

    public function isMaintenanceEnabled(): bool
    {
        return (bool) ($this->config()['maintenance']['enabled'] ?? false);
    }

    public function maintenance(): array
    {
        $maintenance = $this->config()['maintenance'] ?? [];

        return [
            'enabled' => (bool) ($maintenance['enabled'] ?? false),
            'title' => (string) ($maintenance['title'] ?? 'Website đang bảo trì'),
            'message' => (string) ($maintenance['message'] ?? 'Vui lòng quay lại sau.'),
        ];
    }

    public function forFrontend(): array
    {
        $site = $this->config()['site'] ?? [];
        $contact = $this->config()['contact'] ?? [];

        return [
            'name' => (string) ($site['name'] ?? ''),
            'shortName' => (string) ($site['short_name'] ?? ''),
            'tagline' => (string) ($site['tagline'] ?? ''),
            'logoUrl' => (string) ($site['logo_url'] ?? ''),
            'logoAlt' => (string) ($site['logo_alt'] ?? ''),
            'hotline' => (string) ($contact['primary_hotline'] ?? ''),
            'hotlineHref' => (string) ($contact['primary_hotline_href'] ?? ''),
            'zaloUrl' => (string) ($contact['zalo_url'] ?? ''),
            'zaloNumber' => (string) ($contact['zalo_number'] ?? ''),
            'facebookUrl' => (string) ($contact['facebook_url'] ?? ''),
            'address' => (string) ($contact['address'] ?? ''),
            'hours' => (string) ($contact['hours'] ?? ''),
        ];
    }

    public function navigation(): array
    {
        return $this->config()['navigation'] ?? [];
    }

    public function contentForPages(): array
    {
        $content = $this->config()['content'] ?? [];

        return array_merge($content, [
            'navigation' => $this->navigation(),
            'contact' => $this->contactForPages(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function contactForPages(): array
    {
        $contact = $this->config()['contact'] ?? [];
        $content = $this->config()['content'] ?? [];

        return [
            'intro' => (string) ($content['contact_page']['intro'] ?? $content['consultation']['intro'] ?? ''),
            'hotlines' => $contact['hotlines'] ?? [],
            'zalo' => (string) ($contact['zalo_number'] ?? ''),
            'facebook_url' => (string) ($contact['facebook_url'] ?? ''),
            'hours' => (string) ($contact['hours'] ?? ''),
            'branches' => $contact['branches'] ?? [],
        ];
    }
}
