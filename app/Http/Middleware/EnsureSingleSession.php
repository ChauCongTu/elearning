<?php

namespace App\Http\Middleware;

use App\Contracts\Auth\SingleSessionServiceInterface;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class EnsureSingleSession
{
    /**
     * @var list<string>
     */
    private array $exceptRouteNames = [
        'login',
        'login.store',
        'logout',
        'password.required',
        'password.required.update',
    ];

    public function __construct(
        private SingleSessionServiceInterface $singleSessionService,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $this->singleSessionService->shouldEnforce($user)) {
            return $next($request);
        }

        if ($request->routeIs(...$this->exceptRouteNames)) {
            return $next($request);
        }

        if ($this->singleSessionService->isActiveSession($user, $request)) {
            return $next($request);
        }

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('login')
            ->with(
                'status',
                'Phiên đăng nhập của bạn đã kết thúc vì tài khoản được sử dụng trên thiết bị khác.',
            )
            ->withCookie(Cookie::forget(Auth::getRecallerName()));
    }
}
