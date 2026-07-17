import { Link } from '@inertiajs/react';
import {
    CreditCard,
    GraduationCap,
    History,
    ShoppingBag,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Khóa học của tôi',
        href: '/account/courses',
        icon: GraduationCap,
    },
    {
        title: 'Lịch sử mua khóa học',
        href: '/account/purchases',
        icon: ShoppingBag,
    },
    {
        title: 'Lịch sử thanh toán',
        href: '/account/payments',
        icon: CreditCard,
    },
    {
        title: 'Lịch sử đăng nhập',
        href: '/account/login-history',
        icon: History,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset" className="border-r border-pink-100/80 bg-white">
            <SidebarHeader className="border-b border-gray-100">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/account/courses" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Tài khoản học viên" />
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-100">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
