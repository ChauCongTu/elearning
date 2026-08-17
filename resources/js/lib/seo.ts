export function plainText(value: string): string {
    return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncateDescription(value: string, maxLength = 160): string {
    const text = plainText(value);

    if (text.length <= maxLength) {
        return text;
    }

    return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function absoluteUrl(
    appUrl: string,
    url: string | null | undefined,
): string | null {
    if (!url) {
        return null;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    const base = appUrl.replace(/\/$/, '');
    const path = url.startsWith('/') ? url : `/${url}`;

    return `${base}${path}`;
}
