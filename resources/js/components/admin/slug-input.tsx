import type { ChangeEvent } from 'react';
import { ActionIcon, TextInput, type TextInputProps } from '@mantine/core';
import { RefreshCw } from 'lucide-react';
import { slugify } from '@/lib/admin-form';

type Props = TextInputProps & {
    sourceValue?: string;
    onRegenerate?: () => void;
    showRegenerate?: boolean;
};

export default function SlugInput({
    sourceValue = '',
    onRegenerate,
    showRegenerate = false,
    description = 'URL thân thiện. Để trống để hệ thống tự tạo khi lưu.',
    ...props
}: Props) {
    const handleRegenerate = () => {
        if (onRegenerate) {
            onRegenerate();
            return;
        }

        if (sourceValue && props.onChange) {
            props.onChange({
                currentTarget: { value: slugify(sourceValue) },
            } as ChangeEvent<HTMLInputElement>);
        }
    };

    return (
        <TextInput
            {...props}
            description={description}
            rightSection={
                showRegenerate ? (
                    <ActionIcon
                        variant="subtle"
                        color="gray"
                        aria-label="Tạo slug từ tiêu đề"
                        onClick={handleRegenerate}
                    >
                        <RefreshCw size={16} />
                    </ActionIcon>
                ) : undefined
            }
        />
    );
}
