<?php

use App\Contracts\Payment\SePayWebhookKeyServiceInterface;
use Illuminate\Support\Facades\Crypt;

test('webhook key is stored encrypted and can be verified after decrypt', function () {
    $plain = 'sep_test_'.str_repeat('a', 32);
    $stored = 'enc:'.base64_encode(Crypt::encryptString($plain));

    config(['sepay.webhook_api_key' => $stored]);

    $service = app(SePayWebhookKeyServiceInterface::class);

    expect($service->resolvePlaintext())->toBe($plain)
        ->and($service->keySuffix())->toBe(substr($plain, -4))
        ->and($service->isConfigured())->toBeTrue();
});

test('rotate persists encrypted value without plain text prefix', function () {
    $envPath = base_path('.env');
    $backup = file_get_contents($envPath);

    try {
        $plain = app(SePayWebhookKeyServiceInterface::class)->rotate(persist: true);

        expect($plain)->toStartWith('sep_');

        expect(preg_match('/^SEPAY_WEBHOOK_API_KEY="(enc:[^"]+)"/m', file_get_contents($envPath), $matches))->toBe(1)
            ->and($matches[1])->toStartWith('enc:')
            ->and($matches[1])->not->toBe($plain);

        config(['sepay.webhook_api_key' => $matches[1]]);

        expect(app(SePayWebhookKeyServiceInterface::class)->resolvePlaintext())->toBe($plain);
    } finally {
        file_put_contents($envPath, $backup);
    }
});
