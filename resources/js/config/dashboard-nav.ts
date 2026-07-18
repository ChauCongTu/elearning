import type { LucideIcon } from 'lucide-react';

export type DashboardNavItem = {
    title: string;
    href: string;
    icon: LucideIcon;
    adminOnly?: boolean;
    external?: boolean;
};

export type DashboardNavSection = {
    label: string;
    items: DashboardNavItem[];
};
