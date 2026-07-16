import { createTheme } from '@mantine/core';

export const brandTheme = createTheme({
    primaryColor: 'pink',
    fontFamily:
        'Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji',
    headings: {
        fontFamily:
            'Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji',
        fontWeight: '600',
    },
    defaultRadius: 'md',
    colors: {
        brand: [
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
        ],
    },
    primaryShade: { light: 6, dark: 5 },
    components: {
        Button: {
            defaultProps: {
                radius: 'md',
            },
        },
        Card: {
            defaultProps: {
                radius: 'lg',
                withBorder: true,
            },
        },
    },
});

export const brandGradients = {
    primary: 'linear-gradient(135deg, #e64980 0%, #be4bdb 45%, #7950f2 100%)',
    soft: 'linear-gradient(145deg, #fff5f8 0%, #ffffff 35%, #f6f0ff 70%, #ffffff 100%)',
    cta: 'linear-gradient(90deg, #e64980 0%, #be4bdb 55%, #7950f2 100%)',
} as const;
