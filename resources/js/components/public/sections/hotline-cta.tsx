import { Box, Button, Container, Group, Text, Title } from '@mantine/core';
import { MessageCircle, Phone } from 'lucide-react';
import { useSiteConfig } from '@/hooks/use-site-config';

export default function HotlineCta() {
    const site = useSiteConfig();

    return (
        <Box py={56} className="public-cta-band">
            <Container size="md" style={{ position: 'relative', zIndex: 1 }}>
                <Group justify="space-between" align="center" wrap="wrap" gap="xl">
                    <div>
                        <Text size="sm" tt="uppercase" fw={700} c="pink.1" style={{ letterSpacing: '0.1em' }}>
                            Liên hệ hotline
                        </Text>
                        <Title order={2} c="white" mt={4} style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)' }}>
                            {site.hotline}
                        </Title>
                        <Text c="rgba(255,255,255,0.85)" mt="sm" maw={400}>
                            Giải đáp miễn phí mọi thắc mắc — đội ngũ sẵn sàng 8h–20h hàng ngày.
                        </Text>
                    </div>
                    <Group gap="md">
                        <Button
                            component="a"
                            href={site.hotlineHref}
                            size="lg"
                            radius="xl"
                            variant="white"
                            color="pink"
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
                            style={{ borderColor: 'rgba(255,255,255,0.8)', color: '#fff' }}
                        >
                            Chat Zalo
                        </Button>
                    </Group>
                </Group>
            </Container>
        </Box>
    );
}
