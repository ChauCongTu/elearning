<?php

namespace App\Listeners;

use App\Contracts\Auth\SingleSessionServiceInterface;
use App\Models\LoginHistory;
use App\Models\User;
use Illuminate\Http\Request;

class RecordUserLogin
{
    public function __construct(
        private Request $request,
        private SingleSessionServiceInterface $singleSessionService,
    ) {}

    public function record(User $user, ?Request $request = null): void
    {
        $request ??= $this->request;
        $userAgent = $request->userAgent() ?? '';

        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $request->ip(),
        ])->save();

        LoginHistory::create([
            'user_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $userAgent,
            'device' => $this->singleSessionService->resolveDeviceLabel($userAgent),
            'logged_in_at' => now(),
        ]);
    }
}
