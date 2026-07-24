<?php

namespace App\Http\Controllers\Account;

use App\Concerns\PasswordValidationRules;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RequiredPasswordController extends Controller
{
    use PasswordValidationRules;

    public function edit(Request $request): Response|RedirectResponse
    {
        if (! $request->user()?->must_change_password) {
            return redirect()->route('account.courses');
        }

        return Inertia::render('account/required-password', [
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $user = $request->user();

        abort_unless($user?->must_change_password, 403);

        $validated = $request->validate([
            'password' => $this->passwordRules(),
        ], [
            'password.required' => 'Vui lòng nhập mật khẩu mới.',
            'password.confirmed' => 'Xác nhận mật khẩu không khớp.',
        ]);

        $user->update([
            'password' => $validated['password'],
            'must_change_password' => false,
        ]);

        $home = $user->isAdmin() ? route('admin.dashboard') : route('account.courses');

        return redirect($home)->with('success', 'Đã cập nhật mật khẩu. Bạn có thể tiếp tục sử dụng hệ thống.');
    }
}
