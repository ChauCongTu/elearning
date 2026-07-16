import type { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import { Box, Button, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { Phone, Wrench } from 'lucide-react';
import BrandLogo from '@/components/public/brand-logo';
import type { MaintenanceInfo, SiteSettings } from '@/types/site-settings';

type Props = {
    maintenance: MaintenanceInfo;
    siteSettings: SiteSettings;
};

export default function Maintenance({ maintenance, siteSettings }: Props) {
    return (
        <>
            <Head title="Bảo trì" />

            <Box
                mih="100vh"
                className="public-page-bg"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem 0',
                }}
            >
                <Container size="sm">
                    <Paper radius="xl" p="xl" withBorder className="public-glass">
                        <Stack gap="lg" align="center" ta="center">
                            <BrandLogo variant="large" />
                            <Box
                                style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: '50%',
                                    background: 'var(--brand-gradient, linear-gradient(135deg, #e64980, #be4bdb))',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Wrench size={36} color="#fff" />
                            </Box>
                            <Title order={2}>{maintenance.title}</Title>
                            <Text c="dimmed" maw={480} lh={1.7}>
                                {maintenance.message}
                            </Text>
                            <Group gap="md">
                                <Button
                                    component="a"
                                    href={siteSettings.hotlineHref}
                                    color="pink"
                                    radius="xl"
                                    leftSection={<Phone size={18} />}
                                >
                                    {siteSettings.hotline}
                                </Button>
                                <Button
                                    component="a"
                                    href={siteSettings.zaloUrl}
                                    target="_blank"
                                    variant="light"
                                    color="pink"
                                    radius="xl"
                                >
                                    Chat Zalo
                                </Button>
                            </Group>
                            <Text size="xs" c="dimmed">
                                Quản trị viên vẫn có thể đăng nhập tại{' '}
                                <Text component="a" href="/login" c="pink.7" inherit>
                                    /login
                                </Text>
                            </Text>
                        </Stack>
                    </Paper>
                </Container>
            </Box>
        </>
    );
}

Maintenance.layout = (page: ReactNode) => page;
