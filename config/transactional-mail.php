<?php

$defaultAddress = env('MAIL_FROM_ADDRESS', 'info@hocvienbongnhaitrang.com');
$defaultName = env('MAIL_FROM_NAME', env('APP_NAME', 'Laravel'));

$orderAdminBcc = array_values(array_filter(array_map(
    static fn (string $email): string => trim($email),
    explode(',', (string) env('MAIL_ORDER_ADMIN_BCC', '')),
)));

return [

    /*
    |--------------------------------------------------------------------------
    | Default transactional sender
    |--------------------------------------------------------------------------
    |
    | Fallback when a specific case does not define its own from address.
    | Defaults to MAIL_FROM_ADDRESS / MAIL_FROM_NAME from .env.
    |
    | Note: SMTP providers may still rewrite the visible sender to the
    | authenticated account (e.g. Gmail). Use domain SMTP on production.
    |
    */

    'default' => [
        'address' => $defaultAddress,
        'name' => $defaultName,
    ],

    /*
    |--------------------------------------------------------------------------
    | Per-case mail "from" overrides
    |--------------------------------------------------------------------------
    |
    | Each case may override address and/or name. Unset values inherit default.
    |
    */

    'cases' => [
        'registration' => [
            'address' => env('MAIL_FROM_REGISTRATION', $defaultAddress),
            'name' => env('MAIL_FROM_REGISTRATION_NAME', $defaultName),
        ],
        'email_verification' => [
            'address' => env('MAIL_FROM_EMAIL_VERIFICATION', $defaultAddress),
            'name' => env('MAIL_FROM_EMAIL_VERIFICATION_NAME', $defaultName),
        ],
        'order_created' => [
            'address' => env('MAIL_FROM_ORDER_CREATED', $defaultAddress),
            'name' => env('MAIL_FROM_ORDER_CREATED_NAME', $defaultName),
        ],
        'order_paid' => [
            'address' => env('MAIL_FROM_ORDER_PAID', $defaultAddress),
            'name' => env('MAIL_FROM_ORDER_PAID_NAME', $defaultName),
        ],
        'order_expired' => [
            'address' => env('MAIL_FROM_ORDER_EXPIRED', $defaultAddress),
            'name' => env('MAIL_FROM_ORDER_EXPIRED_NAME', $defaultName),
        ],
        'course_completed' => [
            'address' => env('MAIL_FROM_COURSE_COMPLETED', $defaultAddress),
            'name' => env('MAIL_FROM_COURSE_COMPLETED_NAME', $defaultName),
        ],
        'role_changed' => [
            'address' => env('MAIL_FROM_ROLE_CHANGED', $defaultAddress),
            'name' => env('MAIL_FROM_ROLE_CHANGED_NAME', $defaultName),
        ],
        'enrollment_granted' => [
            'address' => env('MAIL_FROM_ENROLLMENT_GRANTED', $defaultAddress),
            'name' => env('MAIL_FROM_ENROLLMENT_GRANTED_NAME', $defaultName),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin BCC for order / course purchase emails
    |--------------------------------------------------------------------------
    |
    | Comma-separated in MAIL_ORDER_ADMIN_BCC. Applied to order_created,
    | order_paid and order_expired notifications.
    |
    */

    'order_admin_bcc' => $orderAdminBcc,

];
