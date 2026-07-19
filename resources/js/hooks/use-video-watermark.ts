import { useEffect, useState } from 'react';
import type { LearnVideoWatermark } from '@/types/learning';

export type VideoWatermarkCorner =
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right';

type Options = {
    watermark: LearnVideoWatermark;
    lessonKey: string;
    active?: boolean;
};

function randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function pickCorner(): VideoWatermarkCorner {
    const corners: VideoWatermarkCorner[] = [
        'top-left',
        'top-right',
        'bottom-left',
        'bottom-right',
    ];

    return corners[Math.floor(Math.random() * corners.length)]!;
}

export function useVideoWatermark({
    watermark,
    lessonKey,
    active = true,
}: Options): {
    visible: boolean;
    corner: VideoWatermarkCorner;
    label: string | null;
} {
    const [visible, setVisible] = useState(false);
    const [corner, setCorner] = useState<VideoWatermarkCorner>('bottom-right');

    useEffect(() => {
        setVisible(false);
        setCorner('bottom-right');

        if (!active || !watermark.enabled || !watermark.label) {
            return;
        }

        let showTimeout = 0;
        let hideTimeout = 0;
        let cancelled = false;

        const scheduleShow = (delayMs: number) => {
            showTimeout = window.setTimeout(() => {
                if (cancelled) {
                    return;
                }

                setCorner(pickCorner());
                setVisible(true);

                const visibleMs =
                    randomBetween(
                        watermark.min_visible_seconds,
                        watermark.max_visible_seconds,
                    ) * 1000;

                hideTimeout = window.setTimeout(() => {
                    if (cancelled) {
                        return;
                    }

                    setVisible(false);

                    const intervalMs =
                        randomBetween(
                            watermark.min_interval_seconds,
                            watermark.max_interval_seconds,
                        ) * 1000;

                    scheduleShow(intervalMs);
                }, visibleMs);
            }, delayMs);
        };

        const initialDelayMs =
            randomBetween(
                watermark.initial_delay_min_seconds,
                watermark.initial_delay_max_seconds,
            ) * 1000;

        scheduleShow(initialDelayMs);

        return () => {
            cancelled = true;
            window.clearTimeout(showTimeout);
            window.clearTimeout(hideTimeout);
        };
    }, [
        active,
        lessonKey,
        watermark.label,
        watermark.enabled,
        watermark.initial_delay_max_seconds,
        watermark.initial_delay_min_seconds,
        watermark.max_interval_seconds,
        watermark.max_visible_seconds,
        watermark.min_interval_seconds,
        watermark.min_visible_seconds,
    ]);

    return {
        visible,
        corner,
        label: watermark.label,
    };
}
