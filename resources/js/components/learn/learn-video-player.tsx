import {
    Keyboard,
    Maximize,
    Minimize,
    Pause,
    Play,
    RotateCcw,
    RotateCw,
    Volume2,
    VolumeX,
} from 'lucide-react';
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type MouseEvent as ReactMouseEvent,
    type ReactNode,
    type RefObject,
} from 'react';
import VideoPlayerShortcutsHelp from '@/components/learn/video-player-shortcuts-help';
import { useVideoPlayerShortcuts } from '@/hooks/use-video-player-shortcuts';
import { formatVideoTime } from '@/lib/format';

const CONTROLS_HIDE_DELAY_MS = 2800;
const SEEK_GRACE_SECONDS = 3;
const SEEK_STEP_SECONDS = 5;
const DOUBLE_TAP_WINDOW_MS = 300;
const SEEK_HINT_VISIBLE_MS = 750;

type SeekHint = {
    id: number;
    side: 'left' | 'right';
    seconds: number;
};

type TapSide = 'left' | 'right';

type LearnVideoPlayerProps = {
    videoRef: RefObject<HTMLVideoElement | null>;
    shellRef: RefObject<HTMLDivElement | null>;
    src: string;
    lessonKey: string;
    lessonTitle: string;
    appName: string;
    startAt: number;
    maxSeekSeconds: number;
    playbackBlocked?: boolean;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    onPreviousLesson?: () => void;
    onNextLesson?: () => void;
    hasPreviousLesson?: boolean;
    hasNextLesson?: boolean;
    watermark?: ReactNode;
    onTimeUpdate?: (currentTime: number) => void;
    onPause?: (currentTime: number) => void;
    onEnded?: (currentTime: number) => void;
    onError?: () => void;
};

export default function LearnVideoPlayer({
    videoRef,
    shellRef,
    src,
    lessonKey,
    lessonTitle,
    appName,
    startAt,
    maxSeekSeconds,
    playbackBlocked = false,
    isFullscreen,
    onToggleFullscreen,
    onPreviousLesson,
    onNextLesson,
    hasPreviousLesson = false,
    hasNextLesson = false,
    watermark,
    onTimeUpdate,
    onPause,
    onEnded,
    onError,
}: LearnVideoPlayerProps) {
    const progressRef = useRef<HTMLDivElement>(null);
    const hideTimerRef = useRef<number | null>(null);
    const draggingRef = useRef(false);
    const lastTapRef = useRef<{ time: number; side: TapSide | null }>({
        time: 0,
        side: null,
    });

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(startAt);
    const [duration, setDuration] = useState(0);
    const [bufferedEnd, setBufferedEnd] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [controlsVisible, setControlsVisible] = useState(true);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [shortcutsHelpVisible, setShortcutsHelpVisible] = useState(false);
    const [seekHint, setSeekHint] = useState<SeekHint | null>(null);
    const shortcutsHelpVisibleRef = useRef(false);

    const clearHideTimer = useCallback(() => {
        if (hideTimerRef.current !== null) {
            window.clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
    }, []);

    const scheduleHideControls = useCallback(() => {
        clearHideTimer();

        hideTimerRef.current = window.setTimeout(() => {
            if (!draggingRef.current && !shortcutsHelpVisibleRef.current) {
                setControlsVisible(false);
            }
        }, CONTROLS_HIDE_DELAY_MS);
    }, [clearHideTimer]);

    const revealControls = useCallback(() => {
        setControlsVisible(true);
        scheduleHideControls();
    }, [scheduleHideControls]);

    const maxAllowedSeek = useCallback(
        (video: HTMLVideoElement) =>
            Math.max(maxSeekSeconds, video.currentTime) + SEEK_GRACE_SECONDS,
        [maxSeekSeconds],
    );

    const seekTo = useCallback(
        (targetSeconds: number) => {
            const video = videoRef.current;

            if (!video || !Number.isFinite(duration) || duration <= 0) {
                return;
            }

            const clamped = Math.min(
                Math.max(0, targetSeconds),
                maxAllowedSeek(video),
                duration,
            );

            video.currentTime = clamped;
            setCurrentTime(clamped);
        },
        [duration, maxAllowedSeek, videoRef],
    );

    const play = useCallback(async () => {
        if (playbackBlocked) {
            return;
        }

        const video = videoRef.current;

        if (!video || (!video.paused && !video.ended)) {
            return;
        }

        try {
            await video.play();
        } catch {
            // Autoplay or gesture restrictions — ignore.
        }

        revealControls();
    }, [playbackBlocked, revealControls, videoRef]);

    const pause = useCallback(() => {
        const video = videoRef.current;

        if (!video || video.paused) {
            return;
        }

        video.pause();
        revealControls();
    }, [revealControls, videoRef]);

    const togglePlay = useCallback(async () => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        if (video.paused || video.ended) {
            await play();
        } else {
            pause();
        }
    }, [pause, play, videoRef]);

    const toggleMute = useCallback(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        video.muted = !video.muted;
        setIsMuted(video.muted);
        revealControls();
    }, [revealControls, videoRef]);

    const handleVolumeChange = useCallback(
        (nextVolume: number) => {
            const video = videoRef.current;

            if (!video) {
                return;
            }

            const clamped = Math.min(Math.max(nextVolume, 0), 1);
            video.volume = clamped;
            video.muted = clamped === 0;
            setVolume(clamped);
            setIsMuted(clamped === 0);
            revealControls();
        },
        [revealControls, videoRef],
    );

    const focusShell = useCallback(() => {
        shellRef.current?.focus({ preventScroll: true });
    }, [shellRef]);

    const seekRelative = useCallback(
        (deltaSeconds: number, side: TapSide) => {
            const video = videoRef.current;

            if (!video) {
                return;
            }

            seekTo(video.currentTime + deltaSeconds);

            const hintId = Date.now();
            setSeekHint({ id: hintId, side, seconds: Math.abs(deltaSeconds) });
            window.setTimeout(() => {
                setSeekHint((current) => (current?.id === hintId ? null : current));
            }, SEEK_HINT_VISIBLE_MS);

            revealControls();
        },
        [revealControls, seekTo, videoRef],
    );

    const resolveTapSide = useCallback(
        (clientX: number): TapSide | null => {
            const shell = shellRef.current;

            if (!shell) {
                return null;
            }

            const rect = shell.getBoundingClientRect();

            return clientX - rect.left < rect.width / 2 ? 'left' : 'right';
        },
        [shellRef],
    );

    const handleDoubleTapSeek = useCallback(
        (clientX: number) => {
            const side = resolveTapSide(clientX);

            if (!side) {
                return;
            }

            lastTapRef.current = { time: 0, side: null };
            seekRelative(side === 'left' ? -SEEK_STEP_SECONDS : SEEK_STEP_SECONDS, side);
        },
        [resolveTapSide, seekRelative],
    );

    const handleSurfaceTap = useCallback(
        (clientX: number) => {
            focusShell();
            revealControls();

            const side = resolveTapSide(clientX);

            if (!side) {
                return;
            }

            const now = Date.now();
            const last = lastTapRef.current;

            if (now - last.time <= DOUBLE_TAP_WINDOW_MS && last.side === side) {
                handleDoubleTapSeek(clientX);
                return;
            }

            lastTapRef.current = { time: now, side };
        },
        [focusShell, handleDoubleTapSeek, revealControls, resolveTapSide],
    );

    const toggleShortcutsHelp = useCallback(() => {
        setShortcutsHelpVisible((visible) => {
            shortcutsHelpVisibleRef.current = !visible;
            return !visible;
        });
        setControlsVisible(true);
        clearHideTimer();
    }, [clearHideTimer]);

    useEffect(() => {
        shortcutsHelpVisibleRef.current = shortcutsHelpVisible;
    }, [shortcutsHelpVisible]);

    useVideoPlayerShortcuts({
        shellRef,
        videoRef,
        enabled: Boolean(src),
        isFullscreen,
        duration,
        maxSeekSeconds,
        seekGraceSeconds: SEEK_GRACE_SECONDS,
        onTogglePlay: () => void togglePlay(),
        onToggleMute: toggleMute,
        onToggleFullscreen,
        onVolumeChange: handleVolumeChange,
        onSeek: seekTo,
        onRevealControls: revealControls,
        onToggleHelp: toggleShortcutsHelp,
        onPreviousLesson,
        onNextLesson,
        hasPreviousLesson,
        hasNextLesson,
    });

    const resolveProgressTime = useCallback(
        (clientX: number) => {
            const track = progressRef.current;

            if (!track || duration <= 0) {
                return 0;
            }

            const rect = track.getBoundingClientRect();
            const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);

            return ratio * duration;
        },
        [duration],
    );

    const handleProgressPointerDown = useCallback(
        (event: ReactMouseEvent<HTMLDivElement>) => {
            event.preventDefault();
            draggingRef.current = true;
            setIsScrubbing(true);
            revealControls();
            seekTo(resolveProgressTime(event.clientX));
        },
        [resolveProgressTime, revealControls, seekTo],
    );

    useEffect(() => {
        const handlePointerMove = (event: MouseEvent) => {
            if (!draggingRef.current) {
                return;
            }

            seekTo(resolveProgressTime(event.clientX));
        };

        const handlePointerUp = () => {
            if (!draggingRef.current) {
                return;
            }

            draggingRef.current = false;
            setIsScrubbing(false);
            scheduleHideControls();
        };

        window.addEventListener('mousemove', handlePointerMove);
        window.addEventListener('mouseup', handlePointerUp);

        return () => {
            window.removeEventListener('mousemove', handlePointerMove);
            window.removeEventListener('mouseup', handlePointerUp);
        };
    }, [resolveProgressTime, scheduleHideControls, seekTo]);

    useEffect(() => {
        setCurrentTime(startAt);
        setIsPlaying(false);
        setControlsVisible(true);
        setShortcutsHelpVisible(false);
        shortcutsHelpVisibleRef.current = false;
        lastTapRef.current = { time: 0, side: null };
        setSeekHint(null);
        clearHideTimer();
    }, [clearHideTimer, lessonKey, startAt]);

    useEffect(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        const applyStartAt = () => {
            if (!Number.isFinite(video.duration) || video.duration <= 0) {
                return;
            }

            const target = Math.min(Math.max(0, startAt), video.duration);
            video.currentTime = target;
            setCurrentTime(target);
        };

        if (video.readyState >= 1) {
            applyStartAt();
        } else {
            video.addEventListener('loadedmetadata', applyStartAt, { once: true });

            return () => {
                video.removeEventListener('loadedmetadata', applyStartAt);
            };
        }
    }, [lessonKey, startAt, videoRef]);

    useEffect(() => {
        if (!playbackBlocked) {
            return;
        }

        videoRef.current?.pause();
        setIsPlaying(false);
        setControlsVisible(true);
        clearHideTimer();
    }, [clearHideTimer, playbackBlocked, videoRef]);

    useEffect(() => {
        const video = videoRef.current;

        if (!video) {
            return;
        }

        const syncBuffered = () => {
            if (video.buffered.length > 0) {
                setBufferedEnd(video.buffered.end(video.buffered.length - 1));
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(Number.isFinite(video.duration) ? video.duration : 0);
            setVolume(video.volume);
            setIsMuted(video.muted);
            syncBuffered();
        };

        const handlePlay = () => {
            setIsPlaying(true);
            scheduleHideControls();
        };

        const handlePause = () => {
            setIsPlaying(false);
            setControlsVisible(true);
            clearHideTimer();
            onPause?.(video.currentTime);
        };

        const handleTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            syncBuffered();
            onTimeUpdate?.(video.currentTime);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setControlsVisible(true);
            clearHideTimer();
            onEnded?.(video.duration || video.currentTime);
        };

        const handleVolumeChangeEvent = () => {
            setVolume(video.volume);
            setIsMuted(video.muted);
        };

        const handleError = () => {
            onError?.();
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('volumechange', handleVolumeChangeEvent);
        video.addEventListener('progress', syncBuffered);
        video.addEventListener('error', handleError);

        if (video.readyState >= 1) {
            handleLoadedMetadata();
        }

        setIsPlaying(!video.paused && !video.ended);

        return () => {
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('volumechange', handleVolumeChangeEvent);
            video.removeEventListener('progress', syncBuffered);
            video.removeEventListener('error', handleError);
        };
    }, [
        clearHideTimer,
        lessonKey,
        onEnded,
        onError,
        onPause,
        onTimeUpdate,
        scheduleHideControls,
        src,
        videoRef,
    ]);

    useEffect(() => () => clearHideTimer(), [clearHideTimer]);

    const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;
    const watchedPercent =
        duration > 0 ? (Math.min(maxSeekSeconds, duration) / duration) * 100 : 0;

    return (
        <div
            ref={shellRef}
            className="learn-video-shell overflow-hidden rounded-xl bg-black shadow-lg select-none"
            tabIndex={0}
            onContextMenu={(event) => event.preventDefault()}
            onMouseMove={revealControls}
            onMouseDown={focusShell}
            onMouseLeave={() => {
                if (isPlaying && !draggingRef.current) {
                    scheduleHideControls();
                }
            }}
        >
            <video
                ref={videoRef}
                key={`${lessonKey}-${src}`}
                src={src}
                disablePictureInPicture
                disableRemotePlayback
                className="learn-video-shell__video aspect-video w-full bg-black"
                preload="metadata"
                playsInline
                onContextMenu={(event) => event.preventDefault()}
            />

            <div
                className="learn-video-tap-layer"
                aria-hidden
                onClick={(event) => {
                    if (event.detail >= 2) {
                        return;
                    }

                    handleSurfaceTap(event.clientX);
                }}
                onDoubleClick={(event) => {
                    event.preventDefault();
                    handleDoubleTapSeek(event.clientX);
                }}
            />

            {seekHint && (
                <div
                    className={`learn-video-ui__seek-hint learn-video-ui__seek-hint--${seekHint.side}`}
                    aria-live="polite"
                >
                    {seekHint.side === 'left' ? (
                        <RotateCcw className="size-9" strokeWidth={1.75} />
                    ) : (
                        <RotateCw className="size-9" strokeWidth={1.75} />
                    )}
                    <span>{seekHint.seconds} giây</span>
                </div>
            )}

            <VideoPlayerShortcutsHelp
                visible={shortcutsHelpVisible}
                onClose={() => {
                    setShortcutsHelpVisible(false);
                    shortcutsHelpVisibleRef.current = false;
                }}
            />

            <div
                className={`learn-video-ui ${controlsVisible || !isPlaying || isScrubbing || shortcutsHelpVisible ? 'learn-video-ui--visible' : ''}`}
            >
                <div className="learn-video-ui__top">
                    <span className="learn-video-ui__title" title={lessonTitle}>
                        {lessonTitle}
                    </span>
                    <span className="learn-video-ui__brand">{appName}</span>
                </div>

                {controlsVisible && !shortcutsHelpVisible && (
                    <button
                        type="button"
                        className="learn-video-ui__center-play"
                        aria-label={isPlaying ? 'Tạm dừng' : 'Phát video'}
                        onClick={() => (isPlaying ? pause() : void play())}
                    >
                        {isPlaying ? (
                            <Pause className="size-10 text-white" strokeWidth={1.5} />
                        ) : (
                            <Play className="size-10 fill-white text-white" strokeWidth={1.5} />
                        )}
                    </button>
                )}

                <div className="learn-video-ui__bottom">
                    <div
                        ref={progressRef}
                        className="learn-video-ui__progress"
                        onMouseDown={handleProgressPointerDown}
                        role="slider"
                        aria-label="Tiến độ video"
                        aria-valuemin={0}
                        aria-valuemax={duration}
                        aria-valuenow={currentTime}
                        tabIndex={0}
                        onKeyDown={(event) => {
                            const video = videoRef.current;

                            if (!video) {
                                return;
                            }

                            if (event.key === 'ArrowLeft') {
                                event.preventDefault();
                                seekTo(video.currentTime - SEEK_STEP_SECONDS);
                            }

                            if (event.key === 'ArrowRight') {
                                event.preventDefault();
                                seekTo(video.currentTime + SEEK_STEP_SECONDS);
                            }
                        }}
                    >
                        <div className="learn-video-ui__progress-track">
                            <div
                                className="learn-video-ui__progress-watched"
                                style={{ width: `${watchedPercent}%` }}
                            />
                            <div
                                className="learn-video-ui__progress-buffered"
                                style={{ width: `${bufferedPercent}%` }}
                            />
                            <div
                                className="learn-video-ui__progress-played"
                                style={{ width: `${playedPercent}%` }}
                            />
                            <div
                                className="learn-video-ui__progress-thumb"
                                style={{ left: `${playedPercent}%` }}
                            />
                        </div>
                    </div>

                    <div className="learn-video-ui__controls">
                        <button
                            type="button"
                            className="learn-video-ui__btn"
                            aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                            onClick={() => (isPlaying ? pause() : void play())}
                        >
                            {isPlaying ? (
                                <Pause className="size-5" />
                            ) : (
                                <Play className="size-5 fill-current" />
                            )}
                        </button>

                        <div className="learn-video-ui__volume">
                            <button
                                type="button"
                                className="learn-video-ui__btn"
                                aria-label={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
                                onClick={toggleMute}
                            >
                                {isMuted || volume === 0 ? (
                                    <VolumeX className="size-5" />
                                ) : (
                                    <Volume2 className="size-5" />
                                )}
                            </button>
                            <input
                                type="range"
                                min={0}
                                max={1}
                                step={0.05}
                                value={isMuted ? 0 : volume}
                                className="learn-video-ui__volume-slider"
                                aria-label="Âm lượng"
                                onChange={(event) =>
                                    handleVolumeChange(Number.parseFloat(event.target.value))
                                }
                            />
                        </div>

                        <span className="learn-video-ui__time">
                            {formatVideoTime(currentTime)} / {formatVideoTime(duration)}
                        </span>

                        <div className="learn-video-ui__spacer" />

                        <button
                            type="button"
                            className="learn-video-ui__btn"
                            aria-label="Phím tắt"
                            title="Phím tắt (?)"
                            onClick={toggleShortcutsHelp}
                        >
                            <Keyboard className="size-5" />
                        </button>

                        <button
                            type="button"
                            className="learn-video-ui__btn"
                            aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}
                            onClick={onToggleFullscreen}
                        >
                            {isFullscreen ? (
                                <Minimize className="size-5" />
                            ) : (
                                <Maximize className="size-5" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {watermark}
        </div>
    );
}
