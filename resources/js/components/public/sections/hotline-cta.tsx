import { Box, Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { MessageCircle, Phone } from 'lucide-react';
import { useSiteConfig } from '@/hooks/use-site-config';

export default function HotlineCta() {
    const site = useSiteConfig();

    return (
        <Box py={64} className="public-cta-band">
            <Container size="md" style={{ position: 'relative', zIndex: 1 }}>
                <Group justify="space-between" align="center" wrap="wrap" gap="xl">
                    <Stack gap="xs" style={{ minWidth: 0 }}>
                        <Text size="sm" fw={700} tt="uppercase" c="white" style={{ letterSpacing: '0.08em', opacity: 0.85 }}>
                            Liên hệ hotline
                        </Text>
                        <Title order={2} c="white" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
                            {site.hotline}
                        </Title>
                        <Text c="rgba(255,255,255,0.88)" maw={420} lh={1.75}>
                            Giải đáp miễn phí mọi thắc mắc — đội ngũ sẵn sàng 8h–20h hàng ngày.
                        </Text>
                    </Stack>
                    <Group gap="md" wrap="wrap">
                        <Button
                            component="a"
                            href={site.hotlineHref}
                            size="lg"
                            radius="xl"
                            variant="white"
                            color="dark"
                            leftSection={<Phone size={18} />}
                        >
                            Gọi ngay
                        </Button>
                        <Button
                            component="a"
                            href={site.zaloUrl}
                            target="_blank"
                            size="lg"
                            radius="xl"
                            variant="outline"
                            leftSection={<MessageCircle size={18} />}
                            style={{ borderColor: 'rgba(255,255,255,0.75)', color: '#fff' }}
                        >
                            Chat Zalo
                        </Button>
                    </Group>
                </Group>
            </Container>
        </Box>
    );
}
