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
    const site = useSiteConfig();
    const user = auth.user;

    const NavItems = ({ vertical = false }: { vertical?: boolean }) => (
        <Group gap={vertical ? 'md' : 'md'} component={vertical ? Stack : Group} wrap="nowrap">
            {(navigation ?? []).map((link) => (
                <Link key={link.href} href={link.href} onClick={close} className="public-nav-link">
                    <Text size="sm" fw={600} style={{ whiteSpace: 'nowrap' }}>
                        {link.label}
                    </Text>
                </Link>
            ))}
            <UnstyledButton
                component="a"
                href={site.hotlineHref}
                style={{ textDecoration: 'none', flexShrink: 0 }}
            >
                <Group gap={6} wrap="nowrap">
                    <Phone size={16} color="var(--mantine-color-pink-6)" />
                    <Text size="sm" fw={600} c="pink.7">
                        {site.hotline}
                    </Text>
                </Group>
            </UnstyledButton>
        </Group>
    );

    return (
        <>
            <Box
                component="header"
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    backdropFilter: 'blur(16px)',
                    backgroundColor: 'rgba(255, 255, 255, 0.82)',
                    borderBottom: '1px solid rgba(230, 73, 128, 0.08)',
                    boxShadow: '0 8px 32px -20px rgba(230, 73, 128, 0.35)',
                }}
            >
                <Container size="xl" h={72}>
                    <Group h="100%" justify="space-between" align="center" wrap="nowrap">
                        <Group gap="sm" align="center" wrap="nowrap" style={{ flexShrink: 0 }}>
                            <Burger
                                opened={opened}
                                onClick={toggle}
                                hiddenFrom="sm"
                                size="sm"
                            />
                            <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
                                <BrandLogo variant="header" />
                            </Link>
                        </Group>

                        <Group
                            gap="md"
                            visibleFrom="lg"
                            wrap="nowrap"
                            style={{ flex: 1, justifyContent: 'center', minWidth: 0 }}
                        >
                            <NavItems />
                        </Group>

                        <Group gap="sm" wrap="nowrap" style={{ flexShrink: 0 }}>
                            {user ? (
                                <Menu shadow="md" width={200}>
                                    <Menu.Target>
                                        <Button
                                            variant="light"
                                            color="pink"
                                            leftSection={<User size={16} />}
                                        >
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
                                                Quản trị
                                            </Menu.Item>
                                        )}
                                        <Menu.Item
                                            component={Link}
                                            href="/dashboard"
                                            leftSection={<User size={16} />}
                                        >
                                            Tài khoản
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
                                        color="pink"
                                    >
                                        Đăng ký
                                    </Button>
                                </>
                            )}
                        </Group>
                    </Group>
                </Container>
            </Box>

            <Drawer opened={opened} onClose={close} size="xs" title="Menu">
                <Stack gap="lg" p="md">
                    <NavItems vertical />
                    {!user && (
                        <Stack gap="sm">
                            <Button component={Link} href="/login" variant="light" fullWidth>
                                Đăng nhập
                            </Button>
                            <Button component={Link} href="/register" color="pink" fullWidth>
                                Đăng ký
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </Drawer>
        </>
    );
}
