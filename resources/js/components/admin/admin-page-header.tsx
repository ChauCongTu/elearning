import { Group, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

type Props = {
    title: string;
    description?: string;
    actions?: ReactNode;
};

export default function AdminPageHeader({ title, description, actions }: Props) {
    return (
        <Group justify="space-between" align="flex-start" mb="lg" wrap="wrap" gap="md">
            <div>
                <Title order={2}>{title}</Title>
                {description && (
                    <Text c="dimmed" mt="xs">
                        {description}
                    </Text>
                )}
            </div>
            {actions}
        </Group>
    );
}
