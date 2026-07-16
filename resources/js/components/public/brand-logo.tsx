import { Box } from '@mantine/core';
import type { CSSProperties } from 'react';
import { useSiteConfig } from '@/hooks/use-site-config';

type LogoVariant = 'header' | 'default' | 'large';

type Props = {
    variant?: LogoVariant;
    height?: number;
    maxWidth?: number;
    className?: string;
    style?: CSSProperties;
};

const variantSizes: Record<LogoVariant, { height: number; maxWidth: number }> = {
    header: { height: 44, maxWidth: 110 },
    default: { height: 40, maxWidth: 100 },
    large: { height: 72, maxWidth: 160 },
};

export default function BrandLogo({
    variant = 'default',
    height,
    maxWidth,
    className,
    style,
}: Props) {
    const site = useSiteConfig();
    const preset = variantSizes[variant];
    const boxHeight = height ?? preset.height;
    const boxMaxWidth = maxWidth ?? preset.maxWidth;

    return (
        <Box
            className={className}
            style={{
                height: boxHeight,
                maxWidth: boxMaxWidth,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                lineHeight: 0,
                ...style,
            }}
        >
            <img
                src={site.logoUrl}
                alt={site.logoAlt}
                style={{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                }}
            />
        </Box>
    );
}
