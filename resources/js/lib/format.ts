export function formatPrice(value: string | number): string {
    return (
        new Intl.NumberFormat('vi-VN').format(Number(value)) + ' đ'
    );
}

export function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    if (minutes === 0) {
        return `${remaining}s`;
    }

    return remaining > 0 ? `${minutes} phút ${remaining}s` : `${minutes} phút`;
}

export function courseThumbnailUrl(
    thumbnailPath: string | null | undefined,
    slug: string,
): string | null {
    if (thumbnailPath) {
        return thumbnailPath.startsWith('http')
            ? thumbnailPath
            : `/storage/${thumbnailPath}`;
    }

    return null;
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
