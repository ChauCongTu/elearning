<?php

namespace App\Enums;

enum EnrollmentSource: string
{
    case Purchase = 'purchase';
    case Migration = 'migration';
    case Manual = 'manual';
}
