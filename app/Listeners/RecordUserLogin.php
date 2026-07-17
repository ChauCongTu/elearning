<?php

namespace App\Listeners;

use App\Models\LoginHistory;
use Illuminate\Auth\Events\Login;
use Illuminate\Http\Request;

class RecordUserLogin
{
    public function __construct(
        private Request $request,
    ) {}

    public function handle(Login $event): void
    {
        $user = $event->user;
        $userAgent = $this->request->userAgent() ?? '';

        $user->forceFill([
            'last_login_at' => now(),
            'last_login_ip' => $this->request->ip(),
        ])->save();

        LoginHistory::create([
            'user_id' => $user->id,
            'ip_address' => $this->request->ip(),
            'user_agent' => $userAgent,
            'device' => $this->resolveDevice($userAgent),
            'logged_in_at' => now(),
        ]);
    }

    private function resolveDevice(string $userAgent): string
    {
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
}
