import { Box, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

type Props = {
    title: string;
    description?: string;
    eyebrow?: string;
    align?: 'left' | 'center';
    action?: ReactNode;
};

export default function SectionHeading({
    title,
    description,
    eyebrow,
    align = 'left',
    action,
}: Props) {
    return (
        <Stack
            gap="sm"
            mb="xl"
            align={align === 'center' ? 'center' : 'flex-start'}
            style={{ textAlign: align }}
            className="public-fade-up"
        >
            {align === 'center' && <Box className="public-section-divider" />}
            {eyebrow && <span className="public-eyebrow">{eyebrow}</span>}
            <Title order={2} style={{ lineHeight: 1.2 }}>
                {title}
            </Title>
            {description && (
                <Text c="dimmed" maw={align === 'center' ? 600 : undefined} size="md">
                    {description}
                </Text>
            )}
            {action}
        </Stack>
    );
}
