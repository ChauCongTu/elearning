<?php

use App\Enums\UserRole;
use App\Models\User;

test('required password page clears must change flag', function () {
    $user = User::factory()->create([
        'role' => UserRole::Student,
        'must_change_password' => true,
        'password' => 'Password1!',
    ]);

    $this->actingAs($user)
        ->put(route('password.required.update'), [
            'password' => 'NewPassword1!',
            'password_confirmation' => 'NewPassword1!',
        ])
        ->assertRedirect(route('account.courses'));

    expect($user->fresh()->must_change_password)->toBeFalse();
});

test('authenticated user with must change password cannot access account until updated', function () {
    $user = User::factory()->create([
        'role' => UserRole::Student,
        'must_change_password' => true,
    ]);

    $this->actingAs($user)
        ->get(route('account.courses'))
        ->assertRedirect(route('password.required'));
});
