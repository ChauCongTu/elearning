import { Box, Container, Paper, Stack, Text, Title } from '@mantine/core';
import type { PropsWithChildren, ReactNode } from 'react';
import BrandLogo from '@/components/public/brand-logo';
import { useSiteConfig } from '@/hooks/use-site-config';

type Props = PropsWithChildren<{
    title: string;
    description?: string;
    maxWidth?: number;
    footer?: ReactNode;
}>;

export default function AuthShell({
    title,
    description,
    maxWidth = 440,
    footer,
    children,
}: Props) {
    const site = useSiteConfig();

    return (
        <Box
            py={{ base: 48, md: 80 }}
            style={{
                background:
                    'radial-gradient(circle at top right, #fff0f6 0%, #ffffff 45%, #f8f9fc 100%)',
            }}
        >
            <Container size="xs">
                <Paper
                    shadow="md"
                    radius="lg"
                    p="xl"
                    withBorder
                    maw={maxWidth}
                    mx="auto"
                >
                    <Stack gap="lg">
                        <Stack gap="xs" align="center">
                            <BrandLogo variant="large" />
                            <Text size="xs" c="dimmed" ta="center">
                                {site.name}
                            </Text>
                        </Stack>
                        <div>
                            <Title order={2}>{title}</Title>
                            {description && (
                                <Text c="dimmed" mt="xs" size="sm">
                                    {description}
                                </Text>
                            )}
                        </div>
                        {children}
                        {footer}
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
