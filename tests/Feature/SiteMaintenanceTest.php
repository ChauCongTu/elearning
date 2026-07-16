<?php

use App\Models\User;

beforeEach(function () {
    config(['site.maintenance.enabled' => false]);
});

test('public home is blocked when maintenance is enabled', function () {
    config(['site.maintenance.enabled' => true]);

    $this->get(route('home'))
        ->assertStatus(503)
        ->assertInertia(fn ($page) => $page
            ->component('public/maintenance')
            ->has('maintenance.title')
            ->has('siteSettings.hotline'));
});

test('login remains accessible during maintenance', function () {
    config(['site.maintenance.enabled' => true]);

    $this->get('/login')->assertOk();
});

test('admin can access public pages during maintenance', function () {
    config(['site.maintenance.enabled' => true]);

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('home'))
        ->assertOk();
});

test('shared site settings come from site json config', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('siteSettings.name')
            ->has('siteSettings.logoUrl')
            ->has('siteSettings.hotline')
            ->where('siteSettings.name', config('site.site.name')));
});
