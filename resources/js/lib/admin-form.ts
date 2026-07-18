import type { RequestPayload } from '@inertiajs/core';

export function slugify(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function prepareMultipartPayload(
    values: Record<string, unknown>,
    fileKeys: string[] = [],
): RequestPayload {
    const payload: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(values)) {
        if (fileKeys.includes(key)) {
            if (value instanceof File) {
                payload[key] = value;
            }
            continue;
        }

        payload[key] = value;
    }

    return payload as RequestPayload;
}
