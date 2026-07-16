<?php

namespace App\Http\Controllers\Public;

use App\Contracts\Content\HomePageServiceInterface;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(
        private HomePageServiceInterface $homePage,
    ) {}

    public function __invoke(): Response
    {
        return Inertia::render('public/home', $this->homePage->getData());
    }
}
