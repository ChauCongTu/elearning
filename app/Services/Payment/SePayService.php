<?php

namespace App\Services\Payment;

use App\Contracts\Mail\TransactionalMailServiceInterface;
use App\Contracts\Payment\SePayServiceInterface;
use App\Contracts\Payment\SePayWebhookKeyServiceInterface;
use App\Enums\EnrollmentSource;
use App\Enums\EnrollmentStatus;
use App\Enums\OrderStatus;
use App\Exceptions\Payment\WebhookProcessingException;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class SePayService implements SePayServiceInterface
{
    public function __construct(
        private SePayWebhookKeyServiceInterface $webhookKeys,
        private TransactionalMailServiceInterface $transactionalMail,
    ) {}
    public function generateQr(Order $order): array
    {
        $accountNumber = config('sepay.account_number');
        $bankCode = config('sepay.bank_code');
        $bankName = (string) (config('sepay.bank_name') ?: $bankCode);

        $query = http_build_query(array_filter([
            'acc' => $accountNumber,
            'bank' => $bankCode,
            'amount' => (int) $order->amount,
            'des' => $order->code,
            'template' => 'compact',
            'holder' => config('sepay.account_name'),
        ], fn ($value) => $value !== null && $value !== ''));

        return [
            'qr_url' => rtrim((string) config('sepay.qr_base_url'), '/').'?'.$query,
            'transfer_content' => $order->code,
            'amount' => (int) $order->amount,
            'bank_code' => (string) $bankCode,
            'bank_name' => $bankName,
            'account_number' => $accountNumber,
            'account_name' => config('sepay.account_name'),
            'is_configured' => $this->isQrConfigured(),
        ];
    }

    public function isQrConfigured(): bool
    {
        return filled(config('sepay.account_number')) && filled(config('sepay.bank_code'));
    }

    public function fetchQrImage(Order $order): array
    {
        if (! $this->isQrConfigured()) {
            throw new \RuntimeException('SePay bank account is not configured.');
        }

        $qr = $this->generateQr($order);

        $response = Http::timeout(15)
            ->withHeaders(['Accept' => 'image/*'])
            ->get($qr['qr_url']);

        if (! $response->successful()) {
            throw new \RuntimeException('Failed to fetch QR image from VietQR.');
        }

        $contentType = $response->header('Content-Type') ?? 'image/png';

        if (! str_starts_with($contentType, 'image/')) {
            throw new \RuntimeException('VietQR returned a non-image response.');
        }

        return [
            'body' => $response->body(),
            'content_type' => $contentType,
            'filename' => 'qr-'.$order->code.'.png',
        ];
    }

    public function verifyWebhookAuthorization(?string $authorizationHeader): bool
    {
        $apiKey = $this->webhookKeys->resolvePlaintext();

        if ($apiKey === null || $apiKey === '') {
            return false;
        }

        $expected = 'Apikey '.$apiKey;

        return hash_equals($expected, trim((string) $authorizationHeader));
    }

    public function processWebhook(array $payload): array
    {
        if (($payload['transferType'] ?? null) !== 'in') {
            throw new WebhookProcessingException('Unsupported transfer type.', 422);
        }

        $transactionId = (string) ($payload['id'] ?? '');

        if ($transactionId === '') {
            throw new WebhookProcessingException('Missing transaction id.', 422);
        }

        $existingPaidOrder = Order::query()
            ->where('sepay_transaction_id', $transactionId)
            ->first();

        if ($existingPaidOrder) {
            return [
                'status' => 'duplicate',
                'order_code' => $existingPaidOrder->code,
            ];
        }

        $orderCode = $this->resolveOrderCode($payload);

        if ($orderCode === null) {
            throw new WebhookProcessingException('Order code not found in webhook payload.', 422);
        }

        $order = Order::query()
            ->where('code', $orderCode)
            ->with('items')
            ->first();

        if (! $order) {
            throw new WebhookProcessingException('Order not found.', 404);
        }

        if ($order->isPaid()) {
            return [
                'status' => 'already_paid',
                'order_code' => $order->code,
            ];
        }

        if ($order->status === OrderStatus::Expired || ($order->expires_at && $order->expires_at->isPast())) {
            throw new WebhookProcessingException('Order expired.', 422);
        }

        $transferAmount = (int) ($payload['transferAmount'] ?? 0);

        if ($transferAmount !== (int) $order->amount) {
            throw new WebhookProcessingException('Amount mismatch.', 422);
        }

        $wasMarkedPaid = false;

        DB::transaction(function () use ($order, $payload, $transactionId, $transferAmount, &$wasMarkedPaid) {
            $order->refresh();

            if ($order->isPaid()) {
                return;
            }

            Payment::query()->create([
                'order_id' => $order->id,
                'gateway' => 'sepay',
                'payload' => $payload,
                'amount' => $transferAmount,
                'received_at' => now(),
            ]);

            $order->update([
                'status' => OrderStatus::Paid,
                'paid_at' => now(),
                'sepay_transaction_id' => $transactionId,
            ]);

            foreach ($order->items as $item) {
                Enrollment::query()->updateOrCreate(
                    [
                        'user_id' => $order->user_id,
                        'course_id' => $item->course_id,
                    ],
                    [
                        'status' => EnrollmentStatus::Active,
                        'source' => EnrollmentSource::Purchase,
                        'enrolled_at' => now(),
                        'progress_percent' => 0,
                    ],
                );
            }

            $wasMarkedPaid = true;
        });

        if ($wasMarkedPaid) {
            $order = $order->fresh(['user', 'items.course']);
            $this->transactionalMail->sendOrderPaid($order);
        }

        return [
            'status' => 'paid',
            'order_code' => $order->code,
        ];
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function resolveOrderCode(array $payload): ?string
    {
        $code = $payload['code'] ?? null;

        if (is_string($code) && $code !== '') {
            return $code;
        }

        $content = (string) ($payload['content'] ?? $payload['description'] ?? '');
        $prefix = (string) config('sepay.order_code_prefix', 'ELN');

        if (preg_match('/'.preg_quote($prefix, '/').'\d{12}/', $content, $matches)) {
            return $matches[0];
        }

        return null;
    }
}
