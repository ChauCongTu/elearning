import type { Auth } from '@/types/auth';
import type { NavLink } from '@/types/navigation';
import type { SiteSettings } from '@/types/site-settings';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            navigation: NavLink[];
            siteSettings: SiteSettings;
            [key: string]: unknown;
        };
    }
}
