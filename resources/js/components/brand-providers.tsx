import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');
import { useMemo, type CSSProperties, type PropsWithChildren } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { SiteSettings, SiteTheme } from '@/types/site-settings';
import { createBrandTheme, themeCssVariables } from '@/theme/brand';

export const defaultSiteTheme: SiteTheme = {
    primary: '#e64980',
    primaryDark: '#c2255c',
    primaryLight: '#fff0f6',
    secondary: '#be4bdb',
    surface: '#fff5f8',
    gradientFrom: '#e64980',
    gradientVia: '#be4bdb',
    gradientTo: '#7950f2',
};

export function resolveSiteSettings(input?: Partial<SiteSettings> | null): SiteSettings {
    return {
        name: input?.name ?? '',
        shortName: input?.shortName ?? '',
        tagline: input?.tagline ?? '',
        logoUrl: input?.logoUrl ?? '',
        logoAlt: input?.logoAlt ?? '',
        hotline: input?.hotline ?? '',
        hotlineHref: input?.hotlineHref ?? '',
        zaloUrl: input?.zaloUrl ?? '',
        zaloNumber: input?.zaloNumber ?? '',
        facebookUrl: input?.facebookUrl ?? '',
        address: input?.address ?? '',
        hours: input?.hours ?? '',
        theme: {
            ...defaultSiteTheme,
            ...(input?.theme ?? {}),
        },
    };
}

type Props = PropsWithChildren<{
    siteSettings: SiteSettings;
}>;

export default function BrandProviders({ siteSettings, children }: Props) {
    const resolved = useMemo(() => resolveSiteSettings(siteSettings), [siteSettings]);
    const mantineTheme = useMemo(() => createBrandTheme(resolved.theme), [resolved.theme]);
    const cssVars = useMemo(
        () => themeCssVariables(resolved.theme) as CSSProperties,
        [resolved.theme],
    );

    return (
        <MantineProvider theme={mantineTheme} defaultColorScheme="light">
            <ModalsProvider>
                <DatesProvider settings={{ locale: 'vi', firstDayOfWeek: 1 }}>
                    <div style={cssVars}>
                        <Notifications position="top-right" />
                        <TooltipProvider delayDuration={0}>
                            {children}
                            <Toaster />
                        </TooltipProvider>
                    </div>
                </DatesProvider>
            </ModalsProvider>
        </MantineProvider>
    );
}
