import { Link, usePage } from '@inertiajs/react';
import {
    ActionIcon,
    Box,
    Container,
    Grid,
    Group,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { Headset, MapPin, Phone } from 'lucide-react';
import { useSiteConfig } from '@/hooks/use-site-config';
import type { NavLink } from '@/types';

type PageProps = {
    navigation: NavLink[];
};

export default function SiteFooter() {
    const { navigation } = usePage<PageProps>().props;
    const site = useSiteConfig();
    const footerLinks = (navigation ?? []).filter(
        (link) => !['/login', '/register'].includes(link.href),
    );

    return (
        <Box component="footer" mt="auto" py={56} className="public-footer-grid">
            <Container size="xl">
                <Grid gap="xl">
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Stack gap="md">
                            <Title order={4} style={{ color: 'var(--brand-primary-dark)' }}>
                                {site.name}
                            </Title>
                            <Text c="dimmed" maw={400} lh={1.7}>
                                {site.tagline}
                            </Text>
                            <Group gap="sm">
                                <ActionIcon
                                    component="a"
                                    href={site.hotlineHref}
                                    variant="light"
                                    color="brand"
                                    size="lg"
                                    radius="xl"
                                >
                                    <Phone size={18} />
                                </ActionIcon>
                                <div>
                                    <Text size="xs" c="dimmed">
                                        Hotline tư vấn 24/7
                                    </Text>
                                    <Text fw={700}>{site.hotline}</Text>
                                </div>
                            </Group>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 6, md: 3 }}>
                        <Stack gap="sm">
                            <Text fw={700}>Liên kết</Text>
                            {footerLinks.map((link) => (
                                <Link key={link.href} href={link.href} className="public-nav-link">
                                    <Text size="sm" c="dimmed">
                                        {link.label}
                                    </Text>
                                </Link>
                            ))}
                            <Link href="/login" className="public-nav-link">
                                <Text size="sm" c="dimmed">
                                    Đăng nhập
                                </Text>
                            </Link>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 6, md: 4 }}>
                        <Stack gap="sm">
                            <Text fw={700}>Hỗ trợ</Text>
                            <Group gap={8}>
                                <Headset size={16} />
                                <Text size="sm" c="dimmed">
                                    Tư vấn miễn phí qua Zalo / Hotline
                                </Text>
                            </Group>
                            <Group gap={8}>
                                <MapPin size={16} />
                                <Text size="sm" c="dimmed">
                                    {site.address}
                                </Text>
                            </Group>
                            <Text
                                component="a"
                                href={site.zaloUrl}
                                target="_blank"
                                rel="noreferrer"
                                size="sm"
                                fw={600}
                                style={{ color: 'var(--brand-primary-dark)', textDecoration: 'none' }}
                            >
                                Chat Zalo ngay →
                            </Text>
                        </Stack>
                    </Grid.Col>
                </Grid>

                <Text ta="center" c="dimmed" size="xs" mt={40}>
                    © {new Date().getFullYear()} {site.name}. All rights reserved.
                </Text>
            </Container>
        </Box>
    );
}
