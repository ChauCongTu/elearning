import { useEffect, type RefObject } from 'react';
import { exitVideoShellFullscreen } from '@/hooks/use-video-shell-fullscreen';

const SEEK_STEP_SHORT_SECONDS = 5;
const SEEK_STEP_LONG_SECONDS = 10;
const VOLUME_STEP = 0.05;

type Options = {
    shellRef: RefObject<HTMLElement | null>;
    videoRef: RefObject<HTMLVideoElement | null>;
    enabled?: boolean;
    isFullscreen: boolean;
    duration: number;
    maxSeekSeconds: number;
    seekGraceSeconds?: number;
    onTogglePlay: () => void;
    onToggleMute: () => void;
    onToggleFullscreen: () => void;
    onVolumeChange: (volume: number) => void;
    onSeek: (seconds: number) => void;
    onRevealControls: () => void;
    onToggleHelp?: () => void;
    onPreviousLesson?: () => void;
    onNextLesson?: () => void;
    hasPreviousLesson?: boolean;
    hasNextLesson?: boolean;
};

function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    if (target.isContentEditable) {
        return true;
    }

    const tag = target.tagName;

    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

function maxAllowedSeek(
    video: HTMLVideoElement,
    maxSeekSeconds: number,
    seekGraceSeconds: number,
): number {
    return Math.max(maxSeekSeconds, video.currentTime) + seekGraceSeconds;
}

export function useVideoPlayerShortcuts({
    shellRef,
    videoRef,
    enabled = true,
    isFullscreen,
    duration,
    maxSeekSeconds,
    seekGraceSeconds = 3,
    onTogglePlay,
    onToggleMute,
    onToggleFullscreen,
    onVolumeChange,
    onSeek,
    onRevealControls,
    onToggleHelp,
    onPreviousLesson,
    onNextLesson,
    hasPreviousLesson = false,
    hasNextLesson = false,
}: Options): void {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (isEditableTarget(event.target)) {
                return;
            }

            const shell = shellRef.current;
            const video = videoRef.current;

            if (!shell || !video) {
                return;
            }

            const reveal = () => {
                onRevealControls();
            };

            const seekBy = (delta: number) => {
                event.preventDefault();
                onSeek(video.currentTime + delta);
                reveal();
            };

            const seekToPercent = (percent: number) => {
                if (!Number.isFinite(duration) || duration <= 0) {
                    return;
                }

                event.preventDefault();
                onSeek(duration * percent);
                reveal();
            };

            const adjustVolume = (delta: number) => {
                event.preventDefault();
                const next = Math.min(Math.max(video.volume + delta, 0), 1);
                onVolumeChange(next);
                reveal();
            };

            switch (event.key) {
                case ' ':
                case 'k':
                case 'K':
                    event.preventDefault();
                    onTogglePlay();
                    break;
                case 'j':
                case 'J':
                    seekBy(-SEEK_STEP_LONG_SECONDS);
                    break;
                case 'l':
                case 'L':
                    seekBy(SEEK_STEP_LONG_SECONDS);
                    break;
                case 'ArrowLeft':
                    seekBy(-SEEK_STEP_SHORT_SECONDS);
                    break;
                case 'ArrowRight':
                    seekBy(SEEK_STEP_SHORT_SECONDS);
                    break;
                case 'ArrowUp':
                    adjustVolume(VOLUME_STEP);
                    break;
                case 'ArrowDown':
                    adjustVolume(-VOLUME_STEP);
                    break;
                case 'Home':
                    event.preventDefault();
                    onSeek(0);
                    reveal();
                    break;
                case 'End': {
                    event.preventDefault();
                    const maxSeek = maxAllowedSeek(
                        video,
                        maxSeekSeconds,
                        seekGraceSeconds,
                    );
                    onSeek(Math.min(maxSeek, duration || maxSeek));
                    reveal();
                    break;
                }
                case 'm':
                case 'M':
                    event.preventDefault();
                    onToggleMute();
                    reveal();
                    break;
                case 'f':
                case 'F':
                    event.preventDefault();
                    onToggleFullscreen();
                    reveal();
                    break;
                case 'Escape':
                    if (isFullscreen) {
                        event.preventDefault();
                        void exitVideoShellFullscreen();
                    }
                    break;
                case '0':
                    seekToPercent(0);
                    break;
                case '1':
                    seekToPercent(0.1);
                    break;
                case '2':
                    seekToPercent(0.2);
                    break;
                case '3':
                    seekToPercent(0.3);
                    break;
                case '4':
                    seekToPercent(0.4);
                    break;
                case '5':
                    seekToPercent(0.5);
                    break;
                case '6':
                    seekToPercent(0.6);
                    break;
                case '7':
                    seekToPercent(0.7);
                    break;
                case '8':
                    seekToPercent(0.8);
                    break;
                case '9':
                    seekToPercent(0.9);
                    break;
                case '?':
                    event.preventDefault();
                    onToggleHelp?.();
                    reveal();
                    break;
                default:
                    if (event.shiftKey && (event.key === 'N' || event.key === 'n')) {
                        if (hasNextLesson && onNextLesson) {
                            event.preventDefault();
                            onNextLesson();
                        }
                    } else if (event.shiftKey && (event.key === 'P' || event.key === 'p')) {
                        if (hasPreviousLesson && onPreviousLesson) {
                            event.preventDefault();
                            onPreviousLesson();
                        }
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [
        duration,
        enabled,
        hasNextLesson,
        hasPreviousLesson,
        isFullscreen,
        maxSeekSeconds,
        onNextLesson,
        onPreviousLesson,
        onRevealControls,
        onSeek,
        onToggleFullscreen,
        onToggleHelp,
        onToggleMute,
        onTogglePlay,
        onVolumeChange,
        seekGraceSeconds,
        shellRef,
        videoRef,
    ]);
}
