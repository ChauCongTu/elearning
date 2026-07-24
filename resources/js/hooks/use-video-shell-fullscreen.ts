import { useCallback, useEffect, useState, type RefObject } from 'react';

function getFullscreenElement(): Element | null {
    return (
        document.fullscreenElement ??
        (document as Document & { webkitFullscreenElement?: Element | null })
            .webkitFullscreenElement ??
        null
    );
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
    toggleFullscreen: () => Promise<void>;
} {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const sync = () => {
            setIsFullscreen(getFullscreenElement() === shellRef.current);
        };

        document.addEventListener('fullscreenchange', sync);
        document.addEventListener('webkitfullscreenchange', sync);
        sync();

        return () => {
            document.removeEventListener('fullscreenchange', sync);
            document.removeEventListener('webkitfullscreenchange', sync);
        };
    }, [shellRef]);

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

    const toggleFullscreen = useCallback(async () => {
        const shell = shellRef.current;

        if (!shell) {
            return;
        }

        if (getFullscreenElement() === shell) {
            await exitVideoShellFullscreen();
            return;
        }

        await enterVideoShellFullscreen(shell);
    }, [shellRef]);

    return { isFullscreen, toggleFullscreen };
}
