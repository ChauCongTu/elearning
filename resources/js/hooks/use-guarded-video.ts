import { notifications } from '@mantine/notifications';
import { useEffect, useRef, type RefObject } from 'react';

const FORWARD_GRACE_SECONDS = 3;
const MAX_PLAYBACK_RATE = 1;
const MAX_SEEK_VIOLATIONS = 3;
const NOTIFY_COOLDOWN_MS = 4000;

type Options = {
    videoRef: RefObject<HTMLVideoElement | null>;
    resumeAt: number;
    lessonKey: string;
    enabled?: boolean;
};

export function useGuardedVideo({
    videoRef,
    resumeAt,
    lessonKey,
    enabled = true,
}: Options): void {
    const maxWatchedRef = useRef(resumeAt);
    const lastTickRef = useRef(resumeAt);
    const seekViolationsRef = useRef(0);
    const strictWarnedRef = useRef(false);
    const lastNotifyAtRef = useRef(0);

    useEffect(() => {
        maxWatchedRef.current = resumeAt;
        lastTickRef.current = resumeAt;
        seekViolationsRef.current = 0;
        strictWarnedRef.current = false;
        lastNotifyAtRef.current = 0;
    }, [lessonKey, resumeAt]);

    useEffect(() => {
        const video = videoRef.current;

        if (!video || !enabled) {
            return;
        }

        const notify = (message: string, color: 'yellow' | 'orange' = 'yellow') => {
            const now = Date.now();

            if (now - lastNotifyAtRef.current < NOTIFY_COOLDOWN_MS) {
                return;
            }

            lastNotifyAtRef.current = now;

            notifications.show({
                title: color === 'orange' ? 'Không được tua nhanh' : undefined,
                message,
                color,
                autoClose: 3500,
            });
        };

        const clampForwardSeek = (): boolean => {
            if (video.currentTime <= maxWatchedRef.current + FORWARD_GRACE_SECONDS) {
                return false;
            }

            video.currentTime = maxWatchedRef.current;
            lastTickRef.current = maxWatchedRef.current;
            seekViolationsRef.current += 1;

            if (seekViolationsRef.current >= MAX_SEEK_VIOLATIONS) {
                if (!strictWarnedRef.current) {
                    strictWarnedRef.current = true;
                    notify(
                        'Bạn đã tua quá nhiều lần. Vui lòng xem tuần tự từng đoạn video.',
                        'orange',
                    );
                }
            } else {
                notify('Không được tua vượt quá phần đã xem.');
            }

            return true;
        };

        const handleTimeUpdate = () => {
            const current = video.currentTime;
            const previous = lastTickRef.current;

            if (!video.paused && current >= previous && current - previous <= 2.5) {
                maxWatchedRef.current = Math.max(maxWatchedRef.current, current);
            } else if (current > maxWatchedRef.current + FORWARD_GRACE_SECONDS) {
                clampForwardSeek();
                return;
            }

            lastTickRef.current = video.currentTime;
        };

        const handleSeeked = () => {
            if (video.currentTime > maxWatchedRef.current + 0.5) {
                clampForwardSeek();
            }
        };

        const handleRateChange = () => {
            if (video.playbackRate > MAX_PLAYBACK_RATE) {
                video.playbackRate = MAX_PLAYBACK_RATE;
                notify('Không hỗ trợ phát video nhanh hơn tốc độ bình thường.');
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('seeked', handleSeeked);
        video.addEventListener('ratechange', handleRateChange);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('seeked', handleSeeked);
            video.removeEventListener('ratechange', handleRateChange);
        };
    }, [enabled, lessonKey, resumeAt, videoRef]);
}
