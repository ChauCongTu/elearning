<?php

namespace App\Http\Responses;

use App\Contracts\Auth\SingleSessionServiceInterface;
use App\Listeners\RecordUserLogin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function __construct(
        private SingleSessionServiceInterface $singleSessionService,
        private RecordUserLogin $recordUserLogin,
    ) {}

    public function toResponse($request): RedirectResponse|JsonResponse
    {
        $user = $request->user();

        if ($user && $this->singleSessionService->shouldEnforce($user)) {
            if (
                $this->singleSessionService->hasActiveSessionElsewhere($user, $request)
                && ! $request->boolean('confirm_session_takeover')
            ) {
                $device = $this->singleSessionService->getActiveSessionDevice($user)
                    ?? 'Thiết bị khác';

                Auth::logout();

                return redirect()
                    ->route('login')
                    ->with('sessionTakeover', [
                        'email' => $request->input('email', $user->email),
                        'device' => $device,
                    ]);
            }

            $this->singleSessionService->activateSession($user, $request);
        }

        if ($user) {
            $this->recordUserLogin->record($user, $request);
        }

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
