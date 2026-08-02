<?php

namespace App\Services\Auth;

use App\Contracts\Auth\SingleSessionServiceInterface;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SingleSessionService implements SingleSessionServiceInterface
{
    public function shouldEnforce(User $user): bool
    {
        return ! $user->isAdmin();
    }

    public function hasActiveSessionElsewhere(User $user, Request $request): bool
    {
        $activeToken = User::query()
            ->whereKey($user->getKey())
            ->value('current_session_id');

        if ($activeToken === null) {
            return false;
        }

        return $activeToken !== $request->session()->get(self::SESSION_TOKEN_KEY);
    }

    public function getActiveSessionDevice(User $user): ?string
    {
        return User::query()
            ->whereKey($user->getKey())
            ->value('current_session_device');
    }

    public function resolveDeviceLabel(?string $userAgent): string
    {
        $userAgent ??= '';

        $browser = match (true) {
            str_contains($userAgent, 'Edg') => 'Edge',
            str_contains($userAgent, 'Chrome') => 'Chrome',
            str_contains($userAgent, 'Firefox') => 'Firefox',
            str_contains($userAgent, 'Safari') => 'Safari',
            default => 'Trình duyệt',
        };

        $os = match (true) {
            str_contains($userAgent, 'Windows') => 'Windows',
            str_contains($userAgent, 'Mac') => 'macOS',
            str_contains($userAgent, 'iPhone') => 'iPhone',
            str_contains($userAgent, 'Android') => 'Android',
            str_contains($userAgent, 'Linux') => 'Linux',
            default => 'Thiết bị',
        };

        return "{$browser} · {$os}";
    }

    public function activateSession(User $user, Request $request): void
    {
        $token = Str::random(40);
        $device = $this->resolveDeviceLabel($request->userAgent());

        $user->forceFill([
            'current_session_id' => $token,
            'current_session_device' => $device,
        ])->save();

        $request->session()->put(self::SESSION_TOKEN_KEY, $token);

        DB::table('sessions')
            ->where('user_id', $user->id)
            ->where('id', '!=', $request->session()->getId())
            ->delete();
    }

    public function isActiveSession(User $user, Request $request): bool
    {
        $activeToken = User::query()
            ->whereKey($user->getKey())
            ->value('current_session_id');

        if ($activeToken === null) {
            return true;
        }

        return $activeToken === $request->session()->get(self::SESSION_TOKEN_KEY);
    }
}
