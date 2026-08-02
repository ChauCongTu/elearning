<?php

use App\Contracts\Auth\SingleSessionServiceInterface;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

test('student login sets current session id', function () {
    $user = User::factory()->create([
        'role' => UserRole::Student,
    ]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('account.courses', absolute: false));

    $user->refresh();

    expect($user->current_session_id)->not->toBeNull();
});

test('student login prompts confirmation when another session is active', function () {
    $user = User::factory()->create([
        'role' => UserRole::Student,
    ]);

    $user->forceFill([
        'current_session_id' => 'existing-token',
        'current_session_device' => 'Chrome · Windows',
    ])->save();

    $response = $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertRedirect(route('login', absolute: false));
    $response->assertSessionHas('sessionTakeover', [
        'email' => $user->email,
        'device' => 'Chrome · Windows',
    ]);
    $this->assertGuest();

    $user->refresh();
    expect($user->current_session_id)->toBe('existing-token');
});

test('student can confirm session takeover and replace previous session', function () {
    config(['session.driver' => 'database']);

    $user = User::factory()->create([
        'role' => UserRole::Student,
    ]);

    $user->forceFill([
        'current_session_id' => 'existing-token',
        'current_session_device' => 'Chrome · Windows',
    ])->save();

    DB::table('sessions')->insert([
        'id' => 'old-session-id',
        'user_id' => $user->id,
        'ip_address' => '127.0.0.1',
        'user_agent' => 'Test',
        'payload' => base64_encode(serialize([])),
        'last_activity' => now()->timestamp,
    ]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'confirm_session_takeover' => true,
    ])->assertRedirect(route('account.courses', absolute: false));

    $user->refresh();

    expect($user->current_session_id)->not->toBe('existing-token')
        ->and($user->current_session_device)->not->toBeNull()
        ->and(DB::table('sessions')->where('id', 'old-session-id')->exists())->toBeFalse();
});

test('student with stale session is logged out on next request', function () {
    $user = User::factory()->create([
        'role' => UserRole::Student,
    ]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    DB::table('users')
        ->where('id', $user->id)
        ->update(['current_session_id' => 'another-device-session']);

    expect(session(SingleSessionServiceInterface::SESSION_TOKEN_KEY))
        ->not->toBe('another-device-session');

    $response = $this->get(route('account.courses'));

    $response->assertRedirect(route('login', absolute: false));
    $response->assertSessionHas(
        'status',
        'Phiên đăng nhập của bạn đã kết thúc vì tài khoản được sử dụng trên thiết bị khác.',
    );
    $this->assertGuest();
});

test('admin is not restricted to a single session', function () {
    $admin = User::factory()->admin()->create();

    $this->post(route('login.store'), [
        'email' => $admin->email,
        'password' => 'password',
    ]);

    $admin->refresh();

    expect($admin->current_session_id)->toBeNull();

    $admin->forceFill(['current_session_id' => 'stale-session-id'])->save();

    $this->actingAs($admin)
        ->get(route('admin.dashboard'))
        ->assertOk();
});

test('student can make multiple requests in the same session', function () {
    $user = User::factory()->create([
        'role' => UserRole::Student,
    ]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $this->assertAuthenticatedAs($user);

    $user->refresh();

    expect(session(SingleSessionServiceInterface::SESSION_TOKEN_KEY))->toBe($user->current_session_id);

    $this->get(route('account.courses'))->assertOk();
    $this->get(route('account.courses'))->assertOk();
    $this->assertAuthenticatedAs($user);
});

test('stale student session clears remember cookie on logout', function () {
    $user = User::factory()->create([
        'role' => UserRole::Student,
    ]);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => 'password',
        'remember' => true,
    ]);

    DB::table('users')
        ->where('id', $user->id)
        ->update(['current_session_id' => 'another-device-session']);

    $response = $this->get(route('account.courses'));

    $response->assertRedirect(route('login', absolute: false));

    $recallerName = Auth::getRecallerName();

    expect(collect($response->headers->getCookies())
        ->contains(fn ($cookie) => $cookie->getName() === $recallerName && $cookie->getExpiresTime() <= time()))
        ->toBeTrue();
});
