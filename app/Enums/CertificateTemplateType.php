<?php

namespace App\Enums;

enum CertificateTemplateType: string
{
    case Default = 'default';
    case Markdown = 'markdown';
    case Latex = 'latex';

    public function label(): string
    {
        return match ($this) {
            self::Default => 'Mặc định (Blade)',
            self::Markdown => 'Markdown',
            self::Latex => 'LaTeX',
        };
    }
}
