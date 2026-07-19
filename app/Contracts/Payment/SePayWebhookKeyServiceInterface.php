<?php

namespace App\Contracts\Payment;

interface SePayWebhookKeyServiceInterface
{
    public function isConfigured(): bool;

    public function resolvePlaintext(): ?string;

    public function keySuffix(): ?string;

    /**
     * Sinh key mới. Trả plaintext một lần để cấu hình SePay; .env chỉ lưu bản mã hóa.
     */
    public function rotate(bool $persist = true): string;
}
