<?php

namespace App\Contracts\Content;

interface SiteSettingsServiceInterface
{
    public function isMaintenanceEnabled(): bool;

    /**
     * @return array{enabled: bool, title: string, message: string}
     */
    public function maintenance(): array;

    /**
     * @return array<string, mixed>
     */
    public function forFrontend(): array;

    /**
     * @return list<array{href: string, label: string}>
     */
    public function navigation(): array;

    /**
     * Marketing + page content for Inertia pages.
     *
     * @return array<string, mixed>
     */
    public function contentForPages(): array;
}
