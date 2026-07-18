import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Tone = 'brand' | 'amber' | 'teal';

type Props = {
    url: string;
    field: string;
    checked: boolean;
    label: string;
    onLabel?: string;
    offLabel?: string;
    tone?: Tone;
};

const defaultLabels: Record<string, { on: string; off: string; tone: Tone }> = {
    is_published: { on: 'Công khai', off: 'Nháp', tone: 'brand' },
    is_featured: { on: 'Nổi bật', off: 'Thường', tone: 'amber' },
    is_active: { on: 'Hiển thị', off: 'Ẩn', tone: 'teal' },
};

function resolveLabels(field: string, onLabel?: string, offLabel?: string, tone?: Tone) {
    const preset = defaultLabels[field];

    return {
        on: onLabel ?? preset?.on ?? 'Bật',
        off: offLabel ?? preset?.off ?? 'Tắt',
        tone: tone ?? preset?.tone ?? 'brand',
    };
}

export default function AdminListSwitch({
    url,
    field,
    checked,
    label,
    onLabel,
    offLabel,
    tone,
}: Props) {
    const labels = resolveLabels(field, onLabel, offLabel, tone);
    const [value, setValue] = useState(checked);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setValue(checked);
    }, [checked]);

    const toggle = () => {
        if (loading) {
            return;
        }

        const next = !value;
        setValue(next);
        setLoading(true);

        router.patch(
            url,
            { [field]: next },
            {
                preserveScroll: true,
                onFinish: () => setLoading(false),
                onError: () => setValue(checked),
            },
        );
    };

    return (
        <button
            type="button"
            className={[
                'admin-status-toggle',
                value ? 'admin-status-toggle--on' : 'admin-status-toggle--off',
                `admin-status-toggle--${labels.tone}`,
                loading ? 'admin-status-toggle--loading' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            aria-label={label}
            aria-pressed={value}
            disabled={loading}
            onClick={toggle}
        >
            {loading ? (
                <Loader2 size={14} className="admin-status-toggle__spinner" aria-hidden />
            ) : (
                <span className="admin-status-toggle__dot" aria-hidden />
            )}
            <span>{value ? labels.on : labels.off}</span>
        </button>
    );
}
