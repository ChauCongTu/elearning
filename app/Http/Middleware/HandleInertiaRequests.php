<?php

namespace App\Http\Middleware;

use App\Contracts\Content\SiteSettingsServiceInterface;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $siteSettings = app(SiteSettingsServiceInterface::class);

        return [
            ...parent::share($request),
            'name' => $siteSettings->forFrontend()['name'] ?: config('app.name'),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'email' => $request->user()->email,
                    'phone' => $request->user()->phone,
                    'role' => $request->user()->role->value,
                    'avatar' => $request->user()->avatar,
                    'avatar_url' => $request->user()->avatarUrl(),
                    'gender' => $request->user()->gender?->value,
                    'birth_year' => $request->user()->birth_year,
                    'preference' => $request->user()->preference,
                    'email_verified_at' => $request->user()->email_verified_at?->toIso8601String(),
                    'last_login_at' => $request->user()->last_login_at?->toIso8601String(),
                ] : null,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'flash' => [
                'consultation_success' => $request->session()->get('consultation_success'),
                'review_success' => $request->session()->get('review_success'),
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'navigation' => $siteSettings->navigation(),
            'siteSettings' => $siteSettings->forFrontend(),
            'appUrl' => rtrim((string) config('app.url'), '/'),
        ];
    }
}
