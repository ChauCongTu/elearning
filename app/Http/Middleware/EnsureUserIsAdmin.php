<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()?->isAdmin()) {
            return $next($request);
        }

        if ($request->expectsJson() || ! $request->isMethod('GET')) {
            abort(403);
        }

        return redirect()
            ->route('account.courses')
            ->with('error', 'Bạn không có quyền truy cập khu vực quản trị.');
    }
}
