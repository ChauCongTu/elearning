<?php

test('about page renders', function () {
    $this->get(route('pages.about'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/pages/about')
            ->has('siteContent.about')
            ->has('siteContent.founder'));
});

test('pricing page renders with spa prices and courses', function () {
    $this->get(route('pages.pricing'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/pages/pricing')
            ->has('siteContent.pricing.groups')
            ->has('courses'));
});

test('contact page renders', function () {
    $this->get(route('pages.contact'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/pages/contact')
            ->has('siteContent.contact.branches')
            ->has('siteContent.consultation'));
});

test('info page renders with student lookup section', function () {
    $this->get(route('pages.info'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('public/pages/info')
            ->has('siteContent.info.sections')
            ->where('lookupQuery', '')
            ->has('lookupResults', 0));
});

test('shared navigation includes landing pages', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('navigation', 7)
            ->where('navigation.2.href', '/tin-tuc')
            ->where('navigation.3.href', '/bang-gia')
            ->where('navigation.4.href', '/ve-chung-toi')
            ->where('navigation.5.href', '/lien-he')
            ->where('navigation.6.href', '/thong-tin'));
});
