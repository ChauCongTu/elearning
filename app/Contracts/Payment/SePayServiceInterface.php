<?php

namespace App\Contracts\Payment;

use App\Models\Order;

interface SePayServiceInterface
{
    /**
     * @return array{
     *     qr_url: string,
     *     transfer_content: string,
     *     amount: int,
     *     bank_code: string,
     *     bank_name: string,
     *     account_number: string|null,
     *     account_name: string|null,
     *     is_configured: bool
     * }
     */
    public function generateQr(Order $order): array;

    public function isQrConfigured(): bool;

    /**
     * @return array{body: string, content_type: string, filename: string}
     */
    public function fetchQrImage(Order $order): array;

    public function verifyWebhookAuthorization(?string $authorizationHeader): bool;

    /**
     * @param  array<string, mixed>  $payload
     * @return array{status: string, order_code?: string}
     */
    public function processWebhook(array $payload): array;
}
