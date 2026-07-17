<?php

use App\Models\User;
use Database\Seeders\ElearningSeeder;

test('guest is redirected from purchase history', function () {
    $this->get(route('account.purchases'))
        ->assertRedirect(route('login'));
});

test('verified student can view purchase history with seeded orders', function () {
    $this->seed(ElearningSeeder::class);

    $user = User::query()->where('email', 'student@example.com')->firstOrFail();

    $this->actingAs($user)
        ->get(route('account.purchases'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('account/purchases')
            ->has('orders', 3));
});

test('verified student can view payment history', function () {
    $this->seed(ElearningSeeder::class);

    $user = User::query()->where('email', 'student@example.com')->firstOrFail();

    $this->actingAs($user)
        ->get(route('account.payments'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('account/payments')
            ->has('payments', 1));
});

test('verified student can view login history', function () {
    $this->seed(ElearningSeeder::class);

    $user = User::query()->where('email', 'student@example.com')->firstOrFail();

    $this->actingAs($user)
        ->get(route('account.login-history'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('account/login-history')
            ->has('entries', 5));
});
