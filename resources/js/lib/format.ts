export function formatPrice(value: string | number): string {
    return (
        new Intl.NumberFormat('vi-VN').format(Number(value)) + ' đ'
    );
}

export function formatDateTime(value: string | null | undefined): string {
    if (!value) {
        return '—';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function formatPaymentMethod(gateway: string | null | undefined): string {
    if (!gateway) {
        return '—';
    }

    const normalized = gateway.toLowerCase();

    if (normalized === 'sepay' || normalized === 'bank_transfer' || normalized === 'transfer') {
        return 'Thanh toán tự động';
    }

    return 'Thanh toán trực tuyến';
}

export function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    if (minutes === 0) {
        return `${remaining}s`;
    }

    return remaining > 0 ? `${minutes} phút ${remaining}s` : `${minutes} phút`;
}

export function mediaUrl(path: string | null | undefined): string | null {
    if (!path) {
        return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    if (path.startsWith('/')) {
        return path;
    }

    if (path.startsWith('images/')) {
        return `/${path}`;
    }

    return `/storage/${path}`;
}

export function courseThumbnailUrl(
    thumbnailPath: string | null | undefined,
    _slug?: string,
): string | null {
    return mediaUrl(thumbnailPath);
}

export function courseGradient(slug: string): string {
    const palettes = [
        'linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)',
        'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)',
        'linear-gradient(135deg, #ffedd5 0%, #fed7aa 50%, #fdba74 100%)',
        'linear-gradient(135deg, #ecfdf5 0%, #bbf7d0 50%, #86efac 100%)',
    ];

    const index =
        slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) %
        palettes.length;

    return palettes[index];
}

/** Gắn ?source=<APP_URL> vào link banner (tracking nguồn click). */
export function withBannerSourceParam(href: string, appUrl: string): string {
    const source = appUrl.replace(/\/$/, '');

    try {
        const url = href.startsWith('http') ? new URL(href) : new URL(href, `${source}/`);
        url.searchParams.set('source', source);

        return url.toString();
    } catch {
        return href;
    }
}
