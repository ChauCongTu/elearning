<?php

return [

    /*
    |--------------------------------------------------------------------------
    | SePay bank account (VietQR)
    |--------------------------------------------------------------------------
    */
    'bank_code' => env('SEPAY_BANK_CODE', 'Vietcombank'),
    'bank_name' => env('SEPAY_BANK_NAME'),
    'account_number' => env('SEPAY_ACCOUNT_NUMBER'),
    'account_name' => env('SEPAY_ACCOUNT_NAME'),

    /*
    |--------------------------------------------------------------------------
    | Webhook authentication (API Key)
    |--------------------------------------------------------------------------
    |
    | SePay sends: Authorization: Apikey YOUR_API_KEY
    | Sinh & mã hóa: php artisan sepay:rotate-webhook-key
    | .env lưu dạng enc:... (mã hóa bằng APP_KEY — không đọc lại được plaintext)
    |
    */
    'webhook_api_key' => env('SEPAY_WEBHOOK_API_KEY'),

    /*
    |--------------------------------------------------------------------------
    | QR image generator
    |--------------------------------------------------------------------------
    */
    'qr_base_url' => env('SEPAY_QR_BASE_URL', 'https://vietqr.app/img'),

    /*
    |--------------------------------------------------------------------------
    | Order settings
    |--------------------------------------------------------------------------
    */
    'order_code_prefix' => env('SEPAY_ORDER_CODE_PREFIX', 'ELN'),
    'payment_expiry_minutes' => (int) env('SEPAY_PAYMENT_EXPIRY_MINUTES', 15),

];
