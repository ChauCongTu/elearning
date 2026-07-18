import { Group } from '@mantine/core';
import { Star } from 'lucide-react';

type Props = {
    value: number;
    size?: number;
};

export default function StarRatingDisplay({ value, size = 16 }: Props) {
    return (
        <Group gap={2}>
            {Array.from({ length: 5 }).map((_, index) => (
                <Star
                    key={index}
                    size={size}
                    fill={index < value ? 'var(--brand-primary)' : 'transparent'}
                    color={index < value ? 'var(--brand-primary)' : '#d1d5db'}
                />
            ))}
        </Group>
    );
}

type InputProps = {
    value: number;
    onChange: (value: number) => void;
};

export function StarRatingInput({ value, onChange }: InputProps) {
    return (
        <Group gap={4}>
            {Array.from({ length: 5 }).map((_, index) => {
                const rating = index + 1;

                return (
                    <button
                        key={rating}
                        type="button"
                        onClick={() => onChange(rating)}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: 0,
                        }}
                        aria-label={`${rating} sao`}
                    >
                        <Star
                            size={22}
                            fill={rating <= value ? 'var(--brand-primary)' : 'transparent'}
                            color={rating <= value ? 'var(--brand-primary)' : '#d1d5db'}
                        />
                    </button>
                );
            })}
        </Group>
    );
}
