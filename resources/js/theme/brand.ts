import { createTheme, type MantineColorsTuple } from '@mantine/core';
import type { SiteTheme } from '@/types/site-settings';

const defaultPalette: MantineColorsTuple = [
    '#fff0f6',
    '#ffd6e7',
    '#ffadd2',
    '#ff85c0',
    '#f06595',
    '#e64980',
    '#d6336c',
    '#c2255c',
    '#a61e4d',
    '#862e9c',
];

const fontStack =
    'Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji';

export function createBrandTheme(theme?: SiteTheme) {
    return createTheme({
        primaryColor: 'brand',
        fontFamily: fontStack,
        headings: {
            fontFamily: fontStack,
            fontWeight: '700',
        },
        defaultRadius: 'lg',
        colors: {
            brand: defaultPalette,
        },
        primaryShade: { light: 6, dark: 5 },
        components: {
            Button: {
                defaultProps: {
                    radius: 'xl',
                },
            },
            Card: {
                defaultProps: {
                    radius: 'xl',
                    withBorder: true,
                },
            },
            Paper: {
                defaultProps: {
                    radius: 'xl',
                },
            },
        },
    });
}

export function themeCssVariables(theme: SiteTheme): Record<string, string> {
    return {
        '--brand-primary': theme.primary,
        '--brand-primary-dark': theme.primaryDark,
        '--brand-primary-light': theme.primaryLight,
        '--brand-secondary': theme.secondary,
        '--brand-surface': theme.surface,
        '--brand-gradient': `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientVia} 55%, ${theme.gradientTo} 100%)`,
        '--brand-gradient-soft': `linear-gradient(160deg, ${theme.surface} 0%, #ffffff 42%, #f6f0ff 100%)`,
        '--brand-gradient-cta': `linear-gradient(90deg, ${theme.gradientFrom} 0%, ${theme.gradientVia} 60%, ${theme.gradientTo} 100%)`,
        '--brand-shadow': `0 20px 48px -16px color-mix(in srgb, ${theme.primary} 32%, transparent)`,
        '--brand-shadow-soft': `0 12px 32px -12px color-mix(in srgb, ${theme.primary} 18%, transparent)`,
        '--brand-glass': 'rgba(255, 255, 255, 0.82)',
        '--brand-glass-border': 'rgba(255, 255, 255, 0.72)',
    };
}

export const brandGradients = {
    primary: 'var(--brand-gradient)',
    soft: 'var(--brand-gradient-soft)',
    cta: 'var(--brand-gradient-cta)',
} as const;
