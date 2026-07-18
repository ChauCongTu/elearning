import { createInertiaApp } from '@inertiajs/react';
import BrandProviders, { resolveSiteSettings } from '@/components/brand-providers';
import { initializeTheme } from '@/hooks/use-appearance';
import DashboardLayout from '@/layouts/dashboard-layout';
import PublicLayout from '@/layouts/public-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { setupInertiaNotifications } from '@/lib/inertia-notifications';
import type { SiteSettings } from '@/types/site-settings';

import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/tiptap/styles.css';

const appName = import.meta.env.VITE_APP_NAME || 'aaa';

setupInertiaNotifications();

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith('account/'):
                return DashboardLayout;
            case name.startsWith('public/'):
                return PublicLayout;
            case name.startsWith('auth/'):
                return PublicLayout;
            case name.startsWith('admin/'):
                return DashboardLayout;
            case name.startsWith('learn/'):
                return undefined;
            case name.startsWith('settings/'):
                return [DashboardLayout, SettingsLayout];
            default:
                return DashboardLayout;
        }
    },
    strictMode: true,
    withApp(app, { page }) {
        const siteSettings = resolveSiteSettings(
            (page.props as { siteSettings?: SiteSettings }).siteSettings,
        );

        return <BrandProviders siteSettings={siteSettings}>{app}</BrandProviders>;
    },
    progress: {
        color: '#e64980',
    },
});

initializeTheme();
