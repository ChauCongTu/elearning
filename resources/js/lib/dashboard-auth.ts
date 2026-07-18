import type { User } from '@/types';

export type DashboardArea = 'admin' | 'student';

export function isAdminUser(user: User | null | undefined): boolean {
    return user?.role === 'admin';
}

export function getDashboardArea(pathname: string): DashboardArea {
    return pathname.startsWith('/admin') ? 'admin' : 'student';
}

export function canAccessAdminArea(user: User | null | undefined): boolean {
    return isAdminUser(user);
}

export function dashboardHomeHref(user: User | null | undefined): string {
    return isAdminUser(user) ? '/admin' : '/account/courses';
}
