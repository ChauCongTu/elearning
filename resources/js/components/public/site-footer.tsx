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
        <Box
            component="footer"
            mt="auto"
            py={48}
            style={{
                background:
                    'linear-gradient(180deg, var(--mantine-color-gray-0) 0%, #fff 100%)',
                borderTop: '1px solid var(--mantine-color-gray-2)',
            }}
        >
            <Container size="xl">
                <Grid gap="xl">
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <Stack gap="md">
                            <Title order={4} c="pink.8">
                                {site.name}
                            </Title>
                            <Text c="dimmed" maw={400}>
                                {site.tagline}
                            </Text>
                            <Group gap="sm">
                                <ActionIcon
                                    component="a"
                                    href={site.hotlineHref}
                                    variant="light"
                                    color="pink"
                                    size="lg"
                                    radius="xl"
                                >
                                    <Phone size={18} />
                                </ActionIcon>
                                <div>
                                    <Text size="xs" c="dimmed">
                                        Hotline tư vấn 24/7
                                    </Text>
                                    <Text fw={600}>{site.hotline}</Text>
                                </div>
                            </Group>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 6, md: 3 }}>
                        <Stack gap="sm">
                            <Text fw={600}>Liên kết</Text>
                            {footerLinks.map((link) => (
                                <Link key={link.href} href={link.href}>
                                    <Text size="sm" c="dimmed">
                                        {link.label}
                                    </Text>
                                </Link>
                            ))}
                            <Link href="/login">
                                <Text size="sm" c="dimmed">
                                    Đăng nhập
                                </Text>
                            </Link>
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 6, md: 4 }}>
                        <Stack gap="sm">
                            <Text fw={600}>Hỗ trợ</Text>
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
                                c="pink.7"
                                fw={500}
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
