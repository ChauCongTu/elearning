import { useEffect } from 'react';

function isBlockedShortcut(event: KeyboardEvent): boolean {
    const key = event.key.toLowerCase();
    const ctrlOrMeta = event.ctrlKey || event.metaKey;

    if (key === 'f12') {
        return true;
    }

    if (ctrlOrMeta && event.shiftKey && ['i', 'j', 'c', 'k'].includes(key)) {
        return true;
    }

    if (ctrlOrMeta && !event.shiftKey && key === 'u') {
        return true;
    }

    if (ctrlOrMeta && !event.shiftKey && key === 's') {
        return true;
    }

    if (ctrlOrMeta && !event.shiftKey && key === 'p') {
        return true;
    }

    // macOS: Cmd+Option+I/J/C/U
    if (event.metaKey && event.altKey && ['i', 'j', 'c', 'u'].includes(key)) {
        return true;
    }

    return false;
}

export function useLearnPageGuard(enabled = true): void {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const blockContextMenu = (event: MouseEvent) => {
            event.preventDefault();
        };

        const blockShortcuts = (event: KeyboardEvent) => {
            if (!isBlockedShortcut(event)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
        };

        const blockDragStart = (event: DragEvent) => {
            if (event.target instanceof HTMLVideoElement) {
                event.preventDefault();
            }
        };

        document.addEventListener('contextmenu', blockContextMenu);
        document.addEventListener('keydown', blockShortcuts, true);
        document.addEventListener('dragstart', blockDragStart);

        return () => {
            document.removeEventListener('contextmenu', blockContextMenu);
            document.removeEventListener('keydown', blockShortcuts, true);
            document.removeEventListener('dragstart', blockDragStart);
        };
    }, [enabled]);
}
