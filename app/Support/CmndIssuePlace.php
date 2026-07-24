<?php

namespace App\Support;

class CmndIssuePlace
{
    private const LABELS = [
        'C1' => 'Cục Cảnh sát quản lý hành chính về trật tự xã hội',
        'C2' => 'Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư',
    ];

    public static function label(?string $code): ?string
    {
        if ($code === null || $code === '') {
            return null;
        }

        return self::LABELS[$code] ?? $code;
    }
}
