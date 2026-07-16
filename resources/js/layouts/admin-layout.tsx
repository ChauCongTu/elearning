import { Link } from '@inertiajs/react';
import { AppShell, NavLink, Text, Title } from '@mantine/core';
import type { PropsWithChildren } from 'react';

const navItems = [
    { href: '/admin', label: 'Tổng quan' },
    { href: '/courses', label: 'Xem site' },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    return (
        <AppShell
            navbar={{ width: 240, breakpoint: 'sm' }}
            header={{ height: 64 }}
            padding="md"
        >
            <AppShell.Header p="md">
                <Title order={4}>Quản trị</Title>
                <Text size="xs" c="dimmed">
                    Học Viện Bông Nhài Trắng
                </Text>
            </AppShell.Header>

            <AppShell.Navbar p="md">
                {navItems.map((item) => (
                    <NavLink
                        key={item.href}
                        component={Link}
                        href={item.href}
                        label={item.label}
                    />
                ))}
            </AppShell.Navbar>

            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
}
