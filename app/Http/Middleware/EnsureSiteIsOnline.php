<?php

namespace App\Http\Middleware;

use App\Contracts\Content\SiteSettingsServiceInterface;
use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class EnsureSiteIsOnline
{
    /**
     * @var list<string>
     */
    private array $allowedPrefixes = [
        'admin',
        'login',
        'logout',
        'register',
        'forgot-password',
        'reset-password',
        'user',
        'email',
        'settings',
        'dashboard',
        'up',
    ];

    public function __construct(
        private SiteSettingsServiceInterface $siteSettings,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->siteSettings->isMaintenanceEnabled()) {
            return $next($request);
        }

        if ($this->canBypass($request)) {
            return $next($request);
        }

        $maintenance = $this->siteSettings->maintenance();

        if ($request->header('X-Inertia')) {
            return Inertia::render('public/maintenance', [
                'maintenance' => $maintenance,
                'siteSettings' => $this->siteSettings->forFrontend(),
            ])->toResponse($request)->setStatusCode(503);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => $maintenance['message'],
            ], 503);
        }

        return Inertia::render('public/maintenance', [
            'maintenance' => $maintenance,
            'siteSettings' => $this->siteSettings->forFrontend(),
        ])->toResponse($request)->setStatusCode(503);
    }

    private function canBypass(Request $request): bool
    {
        if ($request->user()?->isAdmin()) {
            return true;
        }

        foreach ($this->allowedPrefixes as $prefix) {
            if ($request->is($prefix) || $request->is("{$prefix}/*")) {
                return true;
            }
        }

        return false;
    }
}
