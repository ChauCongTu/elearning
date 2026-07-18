import { Link, usePage } from '@inertiajs/react';
import {
    Box,
    Burger,
    Button,
    Container,
    Drawer,
    Group,
    Menu,
    Stack,
    Text,
    UnstyledButton,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LayoutDashboard, LogOut, Phone, User } from 'lucide-react';
import BrandLogo from '@/components/public/brand-logo';
import { useSiteConfig } from '@/hooks/use-site-config';
import type { Auth, NavLink } from '@/types';

type PageProps = {
    auth: Auth;
    navigation: NavLink[];
};

export default function SiteHeader() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const { auth, navigation } = usePage<PageProps>().props;
    const { url } = usePage();
    const site = useSiteConfig();
    const user = auth.user;
    const currentPath = url.split('?')[0];

    const NavItems = ({ vertical = false }: { vertical?: boolean }) => (
        <Group
            gap={vertical ? 'md' : 'lg'}
            component={vertical ? Stack : Group}
            wrap="nowrap"
            justify={vertical ? 'flex-start' : 'center'}
        >
            {(navigation ?? []).map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className="public-nav-link"
                    data-active={currentPath === link.href ? 'true' : undefined}
                >
                    <Text size="sm">{link.label}</Text>
                </Link>
            ))}
        </Group>
    );

    return (
        <>
            <Box component="header" className="public-header">
                <Container size="xl" h={{ base: 68, sm: 72 }}>
                    <Group h="100%" justify="space-between" align="center" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
                            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
                            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                                <BrandLogo variant="header" />
                            </Link>
                        </Group>

                        <Group gap="md" visibleFrom="md" wrap="nowrap" style={{ flex: 1, justifyContent: 'center' }}>
                            <NavItems />
                        </Group>

                        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
                            <UnstyledButton
                                component="a"
                                href={site.hotlineHref}
                                visibleFrom="lg"
                                style={{ textDecoration: 'none' }}
                            >
                                <Group gap={6} wrap="nowrap">
                                    <Phone size={16} color="var(--brand-primary)" />
                                    <Text size="sm" fw={700} style={{ color: 'var(--brand-primary-dark)' }}>
                                        {site.hotline}
                                    </Text>
                                </Group>
                            </UnstyledButton>

                            {user ? (
                                <Menu shadow="md" width={200}>
                                    <Menu.Target>
                                        <Button variant="light" color="brand" leftSection={<User size={16} />}>
                                            {user.name.split(' ').at(-1)}
                                        </Button>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        {user.role === 'admin' && (
                                            <Menu.Item
                                                component={Link}
                                                href="/admin"
                                                leftSection={<LayoutDashboard size={16} />}
                                            >
                                                Khu vực quản trị
                                            </Menu.Item>
                                        )}
                                        <Menu.Item
                                            component={Link}
                                            href="/account/courses"
                                            leftSection={<User size={16} />}
                                        >
                                            {user.role === 'admin' ? 'Khu vực học viên' : 'Tài khoản của tôi'}
                                        </Menu.Item>
                                        <Menu.Divider />
                                        <Menu.Item
                                            component={Link}
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            leftSection={<LogOut size={16} />}
                                        >
                                            Đăng xuất
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            ) : (
                                <>
                                    <Button
                                        component={Link}
                                        href="/login"
                                        variant="subtle"
                                        color="gray"
                                        visibleFrom="xs"
                                    >
                                        Đăng nhập
                                    </Button>
                                    <Button
                                        component={Link}
                                        href="/register"
                                        color="brand"
                                        style={{ background: 'var(--brand-gradient)' }}
                                    >
                                        Đăng ký
                                    </Button>
                                </>
                            )}
                        </Group>
                    </Group>
                </Container>
            </Box>

            <Drawer opened={opened} onClose={close} size="xs" title={site.shortName} radius="lg">
                <Stack gap="lg" p="md">
                    <NavItems vertical />
                    <UnstyledButton component="a" href={site.hotlineHref}>
                        <Group gap={8}>
                            <Phone size={16} color="var(--brand-primary)" />
                            <Text fw={700}>{site.hotline}</Text>
                        </Group>
                    </UnstyledButton>
                    {!user && (
                        <Stack gap="sm">
                            <Button component={Link} href="/login" variant="light" fullWidth>
                                Đăng nhập
                            </Button>
                            <Button
                                component={Link}
                                href="/register"
                                color="brand"
                                fullWidth
                                style={{ background: 'var(--brand-gradient)' }}
                            >
                                Đăng ký
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </Drawer>
        </>
    );
}
