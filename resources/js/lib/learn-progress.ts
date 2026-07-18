import type { LearnProgressResponse } from '@/types/learning';

export function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export async function patchLearnProgress(
    lessonId: string,
    watchedSeconds: number,
): Promise<LearnProgressResponse> {
    const response = await fetch('/learn/progress', {
        method: 'PATCH',
        credentials: 'same-origin',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
            lesson_id: lessonId,
            watched_seconds: Math.floor(watchedSeconds),
        }),
    });

    if (!response.ok) {
        throw new Error('Không thể lưu tiến độ học.');
    }

    return (await response.json()) as LearnProgressResponse;
}
