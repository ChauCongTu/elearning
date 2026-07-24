import { Keyboard, X } from 'lucide-react';

type ShortcutRow = {
    keys: string;
    action: string;
};

const SHORTCUTS: ShortcutRow[] = [
    { keys: 'K / Space', action: 'Phát / Tạm dừng' },
    { keys: 'J', action: 'Lùi 10 giây' },
    { keys: 'L', action: 'Tua 10 giây' },
    { keys: '← / →', action: 'Lùi / Tua 5 giây' },
    { keys: '0 – 9', action: 'Nhảy tới 0% – 90% video' },
    { keys: 'Home / End', action: 'Về đầu / Tới phần đã xem' },
    { keys: 'M', action: 'Bật / Tắt tiếng' },
    { keys: '↑ / ↓', action: 'Tăng / Giảm âm lượng' },
    { keys: 'F', action: 'Toàn màn hình' },
    { keys: 'Esc', action: 'Thoát toàn màn hình' },
    { keys: 'Shift + P', action: 'Bài học trước' },
    { keys: 'Shift + N', action: 'Bài học tiếp theo' },
    { keys: '?', action: 'Hiện / Ẩn bảng phím tắt' },
];

type VideoPlayerShortcutsHelpProps = {
    visible: boolean;
    onClose: () => void;
};

export default function VideoPlayerShortcutsHelp({
    visible,
    onClose,
}: VideoPlayerShortcutsHelpProps) {
    if (!visible) {
        return null;
    }

    return (
        <div className="learn-video-shortcuts" role="dialog" aria-label="Phím tắt video">
            <div className="learn-video-shortcuts__header">
                <div className="learn-video-shortcuts__title">
                    <Keyboard className="size-4" />
                    <span>Phím tắt</span>
                </div>
                <button
                    type="button"
                    className="learn-video-shortcuts__close"
                    aria-label="Đóng"
                    onClick={onClose}
                >
                    <X className="size-4" />
                </button>
            </div>

            <ul className="learn-video-shortcuts__list">
                {SHORTCUTS.map((shortcut) => (
                    <li key={shortcut.keys} className="learn-video-shortcuts__row">
                        <kbd className="learn-video-shortcuts__key">{shortcut.keys}</kbd>
                        <span>{shortcut.action}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
