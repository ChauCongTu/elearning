<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        if ($user?->must_change_password) {
            if ($request->wantsJson()) {
                return new JsonResponse(['must_change_password' => true], 200);
            }

            return redirect()->route('password.required');
        }

        if ($user?->isAdmin()) {
            $home = route('admin.dashboard');
        } elseif ($user && ! $user->hasVerifiedEmail()) {
            $home = route('verification.notice');
        } else {
            $home = route('account.courses');
        }

        if ($request->wantsJson()) {
            return new JsonResponse(['two_factor' => false], 200);
        }

        return redirect()->intended($home);
    }
}
