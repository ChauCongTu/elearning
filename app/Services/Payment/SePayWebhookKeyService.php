<?php

namespace App\Services\Payment;

use App\Contracts\Payment\SePayWebhookKeyServiceInterface;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;
use RuntimeException;

class SePayWebhookKeyService implements SePayWebhookKeyServiceInterface
{
    private const ENCRYPTED_PREFIX = 'enc:';

    public function isConfigured(): bool
    {
        return $this->resolvePlaintext() !== null;
    }

    public function resolvePlaintext(): ?string
    {
        $stored = trim((string) config('sepay.webhook_api_key'));

        if ($stored === '') {
            return null;
        }

        if (str_starts_with($stored, self::ENCRYPTED_PREFIX)) {
            return $this->decrypt(substr($stored, strlen(self::ENCRYPTED_PREFIX)));
        }

        // Legacy: plaintext trong .env — vẫn verify được; rotate sẽ chuyển sang enc:
        return $stored;
    }

    public function keySuffix(): ?string
    {
        $plain = $this->resolvePlaintext();

        if ($plain === null || strlen($plain) < 4) {
            return null;
        }

        return substr($plain, -4);
    }

    public function rotate(bool $persist = true): string
    {
        $plain = 'sep_'.Str::lower(Str::random(40));
        $encrypted = self::ENCRYPTED_PREFIX.$this->encrypt($plain);

        if ($persist) {
            $this->writeEncryptedToEnv($encrypted);
        }

        return $plain;
    }

    private function encrypt(string $plain): string
    {
        return base64_encode(Crypt::encryptString($plain));
    }

    private function decrypt(string $payload): ?string
    {
        try {
            $decoded = base64_decode($payload, true);

            if ($decoded === false) {
                return null;
            }

            return Crypt::decryptString($decoded);
        } catch (\Throwable) {
            return null;
        }
    }

    private function writeEncryptedToEnv(string $encryptedValue): void
    {
        $envPath = base_path('.env');

        if (! is_file($envPath)) {
            throw new RuntimeException('.env không tồn tại.');
        }

        $env = file_get_contents($envPath);

        if ($env === false) {
            throw new RuntimeException('Không đọc được file .env');
        }

        $line = 'SEPAY_WEBHOOK_API_KEY="'.$encryptedValue.'"';

        if (preg_match('/^SEPAY_WEBHOOK_API_KEY=.*/m', $env)) {
            $env = preg_replace('/^SEPAY_WEBHOOK_API_KEY=.*/m', $line, $env) ?? $env;
        } else {
            $env = rtrim($env)."\n{$line}\n";
        }

        file_put_contents($envPath, $env);
    }
}
