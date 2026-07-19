<?php

namespace App\Http\Controllers\Checkout;

use App\Contracts\Payment\OrderServiceInterface;
use App\Contracts\Payment\SePayServiceInterface;
use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class PaymentController extends Controller
{
    public function __construct(
        private OrderServiceInterface $orders,
        private SePayServiceInterface $sepay,
    ) {}

    public function show(Request $request, string $code): InertiaResponse|RedirectResponse
    {
        $order = $this->orders->findOwnedByCode($request->user(), $code);

        if ($order->isPaid()) {
            return redirect()
                ->route('account.courses')
                ->with('success', 'Thanh toán thành công. Khóa học đã được kích hoạt.');
        }

        $isExpired = $order->status === OrderStatus::Expired
            || ($order->expires_at && $order->expires_at->isPast());

        return Inertia::render('public/checkout/payment', [
            'order' => $this->serializeOrder($order, $this->sepay->generateQr($order)),
            'isExpired' => $isExpired,
        ]);
    }

    public function qrImage(Request $request, string $code): Response
    {
        $order = $this->orders->findOwnedByCode($request->user(), $code);

        try {
            $image = $this->sepay->fetchQrImage($order);
        } catch (\Throwable) {
            return $this->qrPlaceholderResponse('Không tải được mã QR. Kiểm tra cấu hình SePay.');
        }

        $headers = [
            'Content-Type' => $image['content_type'],
            'Cache-Control' => 'private, max-age=120',
        ];

        if ($request->boolean('download')) {
            $headers['Content-Disposition'] = 'attachment; filename="'.$image['filename'].'"';
        }

        return response($image['body'], 200, $headers);
    }

    public function status(Request $request, string $code): JsonResponse
    {
        $order = $this->orders->findOwnedByCode($request->user(), $code);

        if ($order->status === OrderStatus::Expired || ($order->expires_at && $order->expires_at->isPast() && ! $order->isPaid())) {
            return response()->json([
                'status' => 'expired',
            ]);
        }

        if ($order->isPaid()) {
            return response()->json([
                'status' => 'paid',
                'redirect_url' => route('account.courses'),
            ]);
        }

        return response()->json([
            'status' => 'pending',
            'expires_at' => $order->expires_at?->toIso8601String(),
        ]);
    }

    /**
     * @param  array<string, mixed>  $qr
     * @return array<string, mixed>
     */
    private function serializeOrder(Order $order, array $qr): array
    {
        $course = $order->items->first()?->course;

        return [
            'code' => $order->code,
            'status' => $order->status->value,
            'amount' => (string) $order->amount,
            'created_at' => $order->created_at?->toIso8601String(),
            'expires_at' => $order->expires_at?->toIso8601String(),
            'course' => $course ? [
                'title' => $course->title,
                'slug' => $course->slug,
                'thumbnail_path' => $course->thumbnail_path,
            ] : null,
            'qr' => [
                ...$qr,
                'image_url' => route('checkout.qr-image', $order->code),
                'download_url' => route('checkout.qr-image', ['code' => $order->code, 'download' => 1]),
            ],
        ];
    }

    private function qrPlaceholderResponse(string $message): Response
    {
        $escaped = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');
        $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <rect width="320" height="320" fill="#f8fafc"/>
  <rect x="16" y="16" width="288" height="288" rx="12" fill="#fff" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="8 6"/>
  <text x="160" y="150" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="14">{$escaped}</text>
</svg>
SVG;

        return response($svg, 200, [
            'Content-Type' => 'image/svg+xml',
            'Cache-Control' => 'no-store',
        ]);
    }
}
