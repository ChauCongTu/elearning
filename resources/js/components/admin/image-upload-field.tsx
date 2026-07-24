import { Box, FileInput, Group, Image, Text, type FileInputProps } from '@mantine/core';
import { useEffect, useState } from 'react';
import { mediaUrl } from '@/lib/format';

type Props = Omit<FileInputProps, 'value' | 'onChange'> & {
    value: File | null;
    onChange: (file: File | null) => void;
    existingUrl?: string | null;
    previewHeight?: number;
    error?: string;
};

export default function ImageUploadField({
    value,
    onChange,
    existingUrl,
    previewHeight = 160,
    error,
    ...props
}: Props) {
    const [preview, setPreview] = useState<string | null>(existingUrl ? mediaUrl(existingUrl) : null);

    useEffect(() => {
        if (!value) {
            setPreview(existingUrl ? mediaUrl(existingUrl) : null);
            return;
        }

        const objectUrl = URL.createObjectURL(value);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [value, existingUrl]);

    return (
        <Box>
            <FileInput {...props} value={value} onChange={onChange} accept="image/*" clearable error={error} />
            {preview && (
                <Group mt="sm" align="flex-start">
                    <Image
                        src={preview}
                        alt=""
                        radius="md"
                        h={previewHeight}
                        w="auto"
                        fit="cover"
                        mah={previewHeight}
                    />
                </Group>
            )}
        </Box>
    );
}
