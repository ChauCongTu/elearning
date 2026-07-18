import type { ReactNode } from 'react';
import { Box, Stack, Text, Title } from '@mantine/core';

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
    align = 'center',
    action,
}: Props) {
    const centered = align === 'center';

    return (
        <Stack
            gap="sm"
            mb="xl"
            align={centered ? 'center' : 'flex-start'}
            style={{ textAlign: centered ? 'center' : 'left' }}
            className="public-section-head public-fade-up"
        >
            {centered && <Box className="public-section-divider" />}
            {eyebrow && <span className="public-kicker">{eyebrow}</span>}
            <Title order={2} lh={1.2} fw={700}>
                {title}
            </Title>
            {description && (
                <Text c="dimmed" maw={centered ? 620 : 680} size="md" lh={1.75}>
                    {description}
                </Text>
            )}
            {action}
        </Stack>
    );
}
