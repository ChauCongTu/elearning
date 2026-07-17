<?php

namespace App\Http\Controllers\Account;

use App\Http\Controllers\Controller;
use App\Models\LoginHistory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LoginHistoryController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $entries = LoginHistory::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('logged_in_at')
            ->limit(50)
            ->get()
            ->map(fn (LoginHistory $entry) => [
                'id' => $entry->id,
                'ip_address' => $entry->ip_address,
                'device' => $entry->device,
                'location' => $entry->location,
                'logged_in_at' => $entry->logged_in_at?->toIso8601String(),
            ])
            ->all();

        return Inertia::render('account/login-history', [
            'entries' => $entries,
        ]);
    }
}
