import { usePage } from '@inertiajs/react';
import type { SiteSettings } from '@/types/site-settings';

type PageProps = {
    siteSettings: SiteSettings;
};

export function useSiteConfig(): SiteSettings {
    const { siteSettings } = usePage<PageProps>().props;

    return siteSettings;
}
