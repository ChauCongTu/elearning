<?php

namespace App\Enums;

enum StudentSource: string
{
    case Online = 'online';
    case Manual = 'manual';
    case Import = 'import';

    public function label(): string
    {
        return match ($this) {
            self::Online => 'Học online',
            self::Manual => 'Nhập thủ công',
            self::Import => 'Import CSV',
        };
    }
}
