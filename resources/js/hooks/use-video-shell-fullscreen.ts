import { useCallback, useEffect, useState, type RefObject } from 'react';

const MOBILE_LANDSCAPE_HTML_CLASS = 'learn-video-mobile-landscape-active';
const MOBILE_LANDSCAPE_SHELL_CLASS = 'learn-video-shell--mobile-landscape';

function getFullscreenElement(): Element | null {
    return (
        document.fullscreenElement ??
        (document as Document & { webkitFullscreenElement?: Element | null })
            .webkitFullscreenElement ??
        null
    );
}

function isPortraitViewport(): boolean {
    return window.matchMedia('(orientation: portrait)').matches;
}

async function lockLandscapeOrientation(): Promise<boolean> {
    try {
        const orientation = screen.orientation as ScreenOrientation & {
            lock?: (orientation: OrientationLockType) => Promise<void>;
        };

        if (typeof orientation?.lock === 'function') {
            await orientation.lock('landscape');
            return true;
        }
    } catch {
        // iOS Safari and some browsers block orientation lock.
    }

    return false;
}

function unlockLandscapeOrientation(): void {
    try {
        screen.orientation?.unlock?.();
    } catch {
        // ignore
    }
}

function enableForcedLandscape(shell: HTMLElement | null): void {
    document.documentElement.classList.add(MOBILE_LANDSCAPE_HTML_CLASS);
    shell?.classList.add(MOBILE_LANDSCAPE_SHELL_CLASS);
}

function disableForcedLandscape(shell: HTMLElement | null): void {
    document.documentElement.classList.remove(MOBILE_LANDSCAPE_HTML_CLASS);
    shell?.classList.remove(MOBILE_LANDSCAPE_SHELL_CLASS);
}

export async function exitVideoShellFullscreen(): Promise<void> {
    const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void>;
    };

    if (doc.fullscreenElement) {
        await doc.exitFullscreen();
        return;
    }

    if (doc.webkitFullscreenElement) {
        await doc.webkitExitFullscreen?.();
    }
}

export async function enterVideoShellFullscreen(shell: HTMLElement): Promise<void> {
    if (shell.requestFullscreen) {
        await shell.requestFullscreen();
        return;
    }

    const webkitShell = shell as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
    };

    await webkitShell.webkitRequestFullscreen?.();
}

export function useVideoShellFullscreen(
    videoRef: RefObject<HTMLVideoElement | null>,
    shellRef: RefObject<HTMLElement | null>,
    enabled = true,
): {
    isFullscreen: boolean;
    isMobileLandscape: boolean;
    toggleFullscreen: () => Promise<void>;
    toggleMobileLandscape: () => Promise<void>;
} {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isForcedLandscape, setIsForcedLandscape] = useState(false);

    const isMobileLandscape = isFullscreen || isForcedLandscape;

    const exitMobileLandscape = useCallback(async () => {
        const shell = shellRef.current;

        disableForcedLandscape(shell);
        setIsForcedLandscape(false);
        unlockLandscapeOrientation();
        await exitVideoShellFullscreen();
    }, [shellRef]);

    const syncForcedLandscape = useCallback(() => {
        const shell = shellRef.current;

        if (!shell || !isForcedLandscape) {
            return;
        }

        if (isPortraitViewport()) {
            enableForcedLandscape(shell);
        } else {
            disableForcedLandscape(shell);
        }
    }, [isForcedLandscape, shellRef]);

    useEffect(() => {
        const sync = () => {
            const active = getFullscreenElement() === shellRef.current;
            setIsFullscreen(active);

            if (!active && isForcedLandscape) {
                disableForcedLandscape(shellRef.current);
                setIsForcedLandscape(false);
                unlockLandscapeOrientation();
            }
        };

        document.addEventListener('fullscreenchange', sync);
        document.addEventListener('webkitfullscreenchange', sync);
        sync();

        return () => {
            document.removeEventListener('fullscreenchange', sync);
            document.removeEventListener('webkitfullscreenchange', sync);
        };
    }, [isForcedLandscape, shellRef]);

    useEffect(() => {
        if (!isForcedLandscape) {
            return;
        }

        const handleOrientationChange = () => {
            syncForcedLandscape();
        };

        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('resize', handleOrientationChange);
        };
    }, [isForcedLandscape, syncForcedLandscape]);

    useEffect(() => {
        const video = videoRef.current;
        const shell = shellRef.current;

        if (!enabled || !video || !shell) {
            return;
        }

        let redirecting = false;

        const redirectVideoFullscreenToShell = async () => {
            if (redirecting || getFullscreenElement() !== video) {
                return;
            }

            redirecting = true;

            try {
                await exitVideoShellFullscreen();
                await enterVideoShellFullscreen(shell);
            } catch {
                // Ignore — custom fullscreen button remains available.
            } finally {
                redirecting = false;
            }
        };

        const handleDoubleClick = (event: MouseEvent) => {
            event.preventDefault();
            void enterVideoShellFullscreen(shell).catch(() => undefined);
        };

        document.addEventListener('fullscreenchange', redirectVideoFullscreenToShell);
        document.addEventListener('webkitfullscreenchange', redirectVideoFullscreenToShell);
        video.addEventListener('dblclick', handleDoubleClick);

        return () => {
            document.removeEventListener('fullscreenchange', redirectVideoFullscreenToShell);
            document.removeEventListener('webkitfullscreenchange', redirectVideoFullscreenToShell);
            video.removeEventListener('dblclick', handleDoubleClick);
        };
    }, [enabled, shellRef, videoRef]);

    useEffect(
        () => () => {
            disableForcedLandscape(shellRef.current);
            unlockLandscapeOrientation();
        },
        [shellRef],
    );

    const toggleFullscreen = useCallback(async () => {
        const shell = shellRef.current;

        if (!shell) {
            return;
        }

        if (getFullscreenElement() === shell) {
            await exitMobileLandscape();
            return;
        }

        await enterVideoShellFullscreen(shell);
    }, [exitMobileLandscape, shellRef]);

    const toggleMobileLandscape = useCallback(async () => {
        const shell = shellRef.current;

        if (!shell) {
            return;
        }

        if (isMobileLandscape) {
            await exitMobileLandscape();
            return;
        }

        try {
            await enterVideoShellFullscreen(shell);
        } catch {
            // Fall back to CSS rotation below.
        }

        await lockLandscapeOrientation();

        if (isPortraitViewport()) {
            enableForcedLandscape(shell);
            setIsForcedLandscape(true);
        }
    }, [exitMobileLandscape, isMobileLandscape, shellRef]);

    return {
        isFullscreen,
        isMobileLandscape,
        toggleFullscreen,
        toggleMobileLandscape,
    };
}
