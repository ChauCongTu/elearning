import { Link } from '@inertiajs/react';
import { AppShell, Box, Group, NavLink, Text, Title } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import { useSiteConfig } from '@/hooks/use-site-config';

const navItems = [
    { href: '/admin', label: 'Tổng quan' },
    { href: '/courses', label: 'Xem site' },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const site = useSiteConfig();

    return (
        <AppShell
            navbar={{ width: 260, breakpoint: 'sm' }}
            header={{ height: 72 }}
            padding={0}
            className="app-shell-page"
        >
            <AppShell.Header className="app-shell-header" px="lg">
                <Group h="100%" justify="space-between">
                    <div>
                        <Title order={4} className="app-shell-title">
                            Quản trị
                        </Title>
                        <Text size="xs" className="app-shell-subtitle">
                            {site.name}
                        </Text>
                    </div>
                    <Box
                        px="md"
                        py={6}
                        style={{
                            borderRadius: 999,
                            background: 'color-mix(in srgb, var(--brand-primary-light) 85%, white)',
                            color: 'var(--brand-primary-dark)',
                            fontWeight: 700,
                            fontSize: 13,
                        }}
                    >
                        Admin
                    </Box>
                </Group>
            </AppShell.Header>

            <AppShell.Navbar p="md" className="app-shell-sidebar-accent">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        component={Link}
                        href={item.href}
                        label={item.label}
                        color="brand"
                        mb={4}
                    />
                ))}
            </AppShell.Navbar>

            <AppShell.Main>
                <Box className="app-shell-content">
                    <Box className="app-shell-card">{children}</Box>
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}
