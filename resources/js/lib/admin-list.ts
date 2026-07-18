import { router } from '@inertiajs/react';

export const FILTER_ALL = 'all';

export function queryParamsFromLocation(): Record<string, string> {
    return Object.fromEntries(new URLSearchParams(window.location.search).entries());
}

export function applyAdminFilters(path: string, values: Record<string, string | null | undefined>): void {
    const params = Object.fromEntries(
        Object.entries(values).filter(([, value]) => value != null && value !== '' && value !== FILTER_ALL),
    );

    router.get(path, params, {
        preserveScroll: true,
        preserveState: false,
        replace: true,
    });
}

export function paginateAdminList(page: number): void {
    router.get(
        window.location.pathname,
        {
            ...queryParamsFromLocation(),
            page,
        },
        {
            preserveScroll: true,
            replace: true,
        },
    );
}

export function toggleAdminField(url: string, payload: Record<string, boolean>): void {
    router.patch(url, payload, {
        preserveScroll: true,
    });
}

export function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export async function uploadEditorImage(file: File): Promise<string> {
    const body = new FormData();
    body.append('image', file);

    const response = await fetch('/admin/uploads/editor-image', {
        method: 'POST',
        body,
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
    });

    if (!response.ok) {
        throw new Error('Không thể tải ảnh lên.');
    }

    const data = (await response.json()) as { url: string };

    return data.url;
}
