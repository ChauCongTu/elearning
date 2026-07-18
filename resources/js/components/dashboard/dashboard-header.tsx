import { Link, usePage } from '@inertiajs/react';
import { ActionIcon, Avatar, Group, Menu, Text, UnstyledButton } from '@mantine/core';
import { Bell, GraduationCap, LayoutDashboard, LogOut, Menu as MenuIcon, Search } from 'lucide-react';
import {
    dashboardPageSubtitle,
    dashboardPageTitle,
} from '@/components/dashboard/dashboard-sidebar';
import {
    canAccessAdminArea,
    getDashboardArea,
    isAdminUser,
} from '@/lib/dashboard-auth';
import type { Auth } from '@/types';

type Props = {
    onToggleSidebar: () => void;
};

type PageProps = {
    auth: Auth;
};

export default function DashboardHeader({ onToggleSidebar }: Props) {
    const { auth } = usePage<PageProps>().props;
    const { url } = usePage();
    const user = auth.user;
    const pathname = url.split('?')[0];
    const area = getDashboardArea(pathname);
    const isAdmin = isAdminUser(user);
    const title = dashboardPageTitle(pathname);
    const subtitle = dashboardPageSubtitle(pathname);

    return (
        <header className="dashboard-topbar">
            <div className="dashboard-topbar__left">
                <ActionIcon
                    variant="subtle"
                    color="gray"
                    className="dashboard-mobile-toggle"
                    onClick={onToggleSidebar}
                    aria-label="Mở menu"
                >
                    <MenuIcon size={18} />
                </ActionIcon>
                <div style={{ minWidth: 0 }}>
                    <Text fw={700} size="lg" truncate>
                        {title}
                    </Text>
                    <Text size="xs" c="dimmed" visibleFrom="sm">
                        {subtitle}
                    </Text>
                </div>
            </div>

            <div className="dashboard-search">
                <Search size={16} />
                <span>Tìm kiếm nhanh...</span>
            </div>

            <div className="dashboard-topbar__right">
                <ActionIcon variant="subtle" color="gray" aria-label="Thông báo">
                    <Bell size={18} />
                </ActionIcon>

                {user && (
                    <Menu shadow="md" width={220}>
                        <Menu.Target>
                            <UnstyledButton>
                                <Group gap="sm" wrap="nowrap">
                                    <Avatar radius="xl" color="brand" size={36}>
                                        {user.name.charAt(0)}
                                    </Avatar>
                                    <div style={{ textAlign: 'left' }} hiddenFrom="sm">
                                        <Text size="sm" fw={600} lh={1.2}>
                                            {user.name}
                                        </Text>
                                        <Text size="xs" c="dimmed" lh={1.2}>
                                            {isAdmin ? 'Quản trị viên' : 'Học viên'}
                                        </Text>
                                    </div>
                                </Group>
                            </UnstyledButton>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {area === 'student' && canAccessAdminArea(user) && (
                                <Menu.Item
                                    component={Link}
                                    href="/admin"
                                    leftSection={<LayoutDashboard size={16} />}
                                >
                                    Khu vực quản trị
                                </Menu.Item>
                            )}
                            {area === 'admin' && (
                                <Menu.Item
                                    component={Link}
                                    href="/account/courses"
                                    leftSection={<GraduationCap size={16} />}
                                >
                                    Khu vực học viên
                                </Menu.Item>
                            )}
                            {area === 'student' && (
                                <Menu.Item
                                    component={Link}
                                    href="/account/courses"
                                    leftSection={<GraduationCap size={16} />}
                                >
                                    Khóa học của tôi
                                </Menu.Item>
                            )}
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
                )}
            </div>
        </header>
    );
}
