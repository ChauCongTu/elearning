<?php

namespace App\Http\Controllers\Checkout;

use App\Contracts\Catalog\CourseCatalogServiceInterface;
use App\Contracts\Payment\OrderServiceInterface;
use App\Exceptions\Payment\CheckoutException;
use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function __construct(
        private CourseCatalogServiceInterface $courses,
        private OrderServiceInterface $orders,
    ) {}

    public function store(Request $request, string $slug): RedirectResponse
    {
        try {
            $course = $this->courses->findPublishedBySlug($slug);
            $order = $this->orders->createForCourse($request->user(), $course);

            return redirect()->route('checkout.payment', $order->code);
        } catch (CheckoutException $exception) {
            return redirect()
                ->route('courses.show', $slug)
                ->with('error', $exception->getMessage());
        }
    }
}
