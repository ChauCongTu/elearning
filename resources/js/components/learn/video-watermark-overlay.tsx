import type { VideoWatermarkCorner } from '@/hooks/use-video-watermark';

type Props = {
    label: string;
    visible: boolean;
    corner: VideoWatermarkCorner;
};

const cornerClass: Record<VideoWatermarkCorner, string> = {
    'top-left': 'learn-video-watermark--top-left',
    'top-right': 'learn-video-watermark--top-right',
    'bottom-left': 'learn-video-watermark--bottom-left',
    'bottom-right': 'learn-video-watermark--bottom-right',
};

export default function VideoWatermarkOverlay({ label, visible, corner }: Props) {
    return (
        <div
            className={`learn-video-watermark ${cornerClass[corner]} ${
                visible ? 'learn-video-watermark--visible' : ''
            }`}
            aria-hidden="true"
        >
            {label}
        </div>
    );
}
