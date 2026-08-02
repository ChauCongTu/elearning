<?php

namespace App\Contracts\Auth;

use App\Models\User;
use Illuminate\Http\Request;

interface SingleSessionServiceInterface
{
    public const SESSION_TOKEN_KEY = 'single_session_token';

    public function shouldEnforce(User $user): bool;

    public function hasActiveSessionElsewhere(User $user, Request $request): bool;

    public function getActiveSessionDevice(User $user): ?string;

    public function resolveDeviceLabel(?string $userAgent): string;

    public function activateSession(User $user, Request $request): void;

    public function isActiveSession(User $user, Request $request): bool;
}
