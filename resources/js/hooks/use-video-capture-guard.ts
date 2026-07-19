import { notifications } from '@mantine/notifications';
import { useEffect, type RefObject } from 'react';
import type { LearnVideoCaptureGuard } from '@/types/learning';

const NOTIFY_COOLDOWN_MS = 5000;

type Options = {
    videoRef: RefObject<HTMLVideoElement | null>;
    config: LearnVideoCaptureGuard;
    lessonKey: string;
    active?: boolean;
};

function isCaptureShortcut(event: KeyboardEvent): boolean {
    const key = event.key;

    if (key === 'PrintScreen') {
        return true;
    }

    const lowerKey = key.toLowerCase();
    const shift = event.shiftKey;
    const metaOrWin = event.metaKey || event.getModifierState?.('OS') === true;

    if (metaOrWin && shift && ['3', '4', '5'].includes(key)) {
        return true;
    }

    if (metaOrWin && shift && event.ctrlKey && ['3', '4'].includes(key)) {
        return true;
    }

    if (metaOrWin && shift && lowerKey === 's') {
        return true;
    }

    if (event.ctrlKey && shift && lowerKey === 's') {
        return true;
    }

    return false;
}

export function useVideoCaptureGuard({
    videoRef,
    config,
    lessonKey,
    active = true,
}: Options): void {
    useEffect(() => {
        if (!active || !config.enabled) {
            return;
        }

        let lastNotifyAt = 0;

        const notifyCaptureBlocked = (message: string) => {
            const now = Date.now();

            if (now - lastNotifyAt < NOTIFY_COOLDOWN_MS) {
                return;
            }

            lastNotifyAt = now;

            notifications.show({
                title: 'Không được ghi hình hoặc chụp màn hình',
                message,
                color: 'orange',
                autoClose: 4500,
            });
        };

        const pauseVideo = () => {
            const video = videoRef.current;

            if (video && !video.paused) {
                video.pause();
            }
        };

        const handleCaptureAttempt = (message: string) => {
            pauseVideo();
            notifyCaptureBlocked(message);

            if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                void navigator.clipboard.writeText('').catch(() => undefined);
            }
        };

        const handleVisibilityChange = () => {
            if (!config.pause_on_hidden || !document.hidden) {
                return;
            }

            pauseVideo();
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (!config.block_capture_shortcuts || !isCaptureShortcut(event)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            handleCaptureAttempt(
                'Video đã tạm dừng. Nội dung khóa học không được phép ghi lại hoặc chụp màn hình.',
            );
        };

        const handleKeyUp = (event: KeyboardEvent) => {
            if (!config.block_capture_shortcuts || event.key !== 'PrintScreen') {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            handleCaptureAttempt(
                'Phát hiện phím chụp màn hình. Video đã tạm dừng để bảo vệ nội dung.',
            );
        };

        const handleCopy = (event: ClipboardEvent) => {
            const video = videoRef.current;

            if (!video) {
                return;
            }

            const target = event.target;

            if (target instanceof Node && video.contains(target)) {
                event.preventDefault();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        if (config.block_capture_shortcuts) {
            document.addEventListener('keydown', handleKeyDown, true);
            document.addEventListener('keyup', handleKeyUp, true);
        }

        document.addEventListener('copy', handleCopy);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);

            if (config.block_capture_shortcuts) {
                document.removeEventListener('keydown', handleKeyDown, true);
                document.removeEventListener('keyup', handleKeyUp, true);
            }

            document.removeEventListener('copy', handleCopy);
        };
    }, [
        active,
        config.block_capture_shortcuts,
        config.enabled,
        config.pause_on_hidden,
        lessonKey,
        videoRef,
    ]);
}
