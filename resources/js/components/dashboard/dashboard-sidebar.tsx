import { Link, usePage } from '@inertiajs/react';
import {
    ArrowLeftRight,
    BookOpen,
    CreditCard,
    ExternalLink,
    FolderTree,
    GraduationCap,
    History,
    Image,
    LayoutDashboard,
    MessageSquare,
    Newspaper,
    Shield,
    ShoppingBag,
    Tags,
    User,
    Users,
} from 'lucide-react';
import { useSiteConfig } from '@/hooks/use-site-config';
import { useCurrentUrl } from '@/hooks/use-current-url';
import {
    canAccessAdminArea,
    dashboardHomeHref,
    getDashboardArea,
    isAdminUser,
} from '@/lib/dashboard-auth';
import type { DashboardNavSection } from '@/config/dashboard-nav';
import type { Auth } from '@/types';

type PageProps = {
    auth: Auth;
};

const studentSection: DashboardNavSection = {
    label: 'Học viên',
    items: [
        { title: 'Khóa học của tôi', href: '/account/courses', icon: GraduationCap },
        { title: 'Lịch sử mua khóa', href: '/account/purchases', icon: ShoppingBag },
        { title: 'Lịch sử thanh toán', href: '/account/payments', icon: CreditCard },
        { title: 'Lịch sử đăng nhập', href: '/account/login-history', icon: History },
    ],
};

const settingsSection: DashboardNavSection = {
    label: 'Cài đặt',
    items: [
        { title: 'Hồ sơ cá nhân', href: '/settings/profile', icon: User },
        { title: 'Bảo mật', href: '/settings/security', icon: Shield },
    ],
};

const adminSection: DashboardNavSection = {
    label: 'Quản trị',
    items: [
        { title: 'Tổng quan', href: '/admin', icon: LayoutDashboard, adminOnly: true },
        { title: 'Người dùng', href: '/admin/users', icon: Users, adminOnly: true },
        { title: 'Danh mục', href: '/admin/categories', icon: FolderTree, adminOnly: true },
        { title: 'Khóa học', href: '/admin/courses', icon: BookOpen, adminOnly: true },
        { title: 'Đơn hàng', href: '/admin/orders', icon: ShoppingBag, adminOnly: true },
        { title: 'Banner', href: '/admin/banners', icon: Image, adminOnly: true },
        { title: 'Tin tức', href: '/admin/posts', icon: Newspaper, adminOnly: true },
        { title: 'DM tin tức', href: '/admin/post-categories', icon: Tags, adminOnly: true },
        { title: 'Đánh giá', href: '/admin/reviews', icon: MessageSquare, adminOnly: true },
    ],
};

export function buildDashboardNav(isAdmin: boolean, area: 'admin' | 'student'): DashboardNavSection[] {
    if (area === 'admin') {
        if (!isAdmin) {
            return [studentSection, settingsSection];
        }

        return [
            adminSection,
            {
                label: 'Chuyển khu vực',
                items: [
                    {
                        title: 'Khu vực học viên',
                        href: '/account/courses',
                        icon: GraduationCap,
                    },
                    { title: 'Xem website', href: '/', icon: ExternalLink, external: true },
                ],
            },
        ];
    }

    const sections: DashboardNavSection[] = [studentSection, settingsSection];

    if (isAdmin) {
        sections.unshift({
            label: 'Chuyển khu vực',
            items: [
                {
                    title: 'Khu vực quản trị',
                    href: '/admin',
                    icon: ArrowLeftRight,
                    adminOnly: true,
                },
            ],
        });
    }

    return sections;
}

type SidebarProps = {
    opened: boolean;
    onNavigate?: () => void;
};

export default function DashboardSidebar({ opened, onNavigate }: SidebarProps) {
    const site = useSiteConfig();
    const { auth } = usePage<PageProps>().props;
    const { url } = usePage();
    const { isCurrentUrl } = useCurrentUrl();
    const pathname = url.split('?')[0];
    const isAdmin = isAdminUser(auth.user);
    const area = getDashboardArea(pathname);
    const sections = buildDashboardNav(isAdmin, area);
    const homeHref = dashboardHomeHref(auth.user);

    return (
        <aside className={`dashboard-sidebar${opened ? ' dashboard-sidebar--open' : ' dashboard-sidebar--mobile-hidden'}`}>
            <div className="dashboard-sidebar__brand">
                <Link href={homeHref} onClick={onNavigate} style={{ textDecoration: 'none' }}>
                    <div className="dashboard-sidebar__brand-title">{site.shortName}</div>
                    <div className="dashboard-sidebar__brand-sub">
                        {area === 'admin' && canAccessAdminArea(auth.user)
                            ? 'Khu vực quản trị'
                            : 'Khu vực học viên'}
                    </div>
                </Link>
            </div>

            <div className="dashboard-sidebar__scroll">
                {sections.map((section) => (
                    <div key={section.label} className="dashboard-nav-section">
                        <div className="dashboard-nav-section__label">{section.label}</div>
                        {section.items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onNavigate}
                                className="dashboard-nav-link"
                                data-active={isCurrentUrl(item.href) ? 'true' : undefined}
                                {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                            >
                                <item.icon size={18} />
                                <span>{item.title}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </div>

            <div className="dashboard-sidebar__footer">© {new Date().getFullYear()} {site.name}</div>
        </aside>
    );
}

export function dashboardPageTitle(pathname: string): string {
    if (pathname.startsWith('/admin/users/') && pathname !== '/admin/users') return 'Chi tiết người dùng';
    if (pathname.startsWith('/admin/users')) return 'Người dùng';
    if (pathname.startsWith('/admin/categories')) return 'Danh mục khóa học';
    if (pathname.startsWith('/admin/courses/create')) return 'Thêm khóa học';
    if (pathname.includes('/curriculum')) return 'Chương trình học';
    if (pathname.includes('/admin/courses/') && pathname.includes('/edit')) return 'Sửa khóa học';
    if (pathname.startsWith('/admin/courses')) return 'Khóa học';
    if (pathname.startsWith('/admin/orders/') && pathname !== '/admin/orders') return 'Chi tiết đơn hàng';
    if (pathname.startsWith('/admin/orders')) return 'Đơn hàng';
    if (pathname.startsWith('/admin/banners')) return 'Banner';
    if (pathname.startsWith('/admin/posts/create')) return 'Viết bài mới';
    if (pathname.includes('/admin/posts/') && pathname.includes('/edit')) return 'Sửa bài viết';
    if (pathname.startsWith('/admin/posts')) return 'Tin tức';
    if (pathname.startsWith('/admin/post-categories')) return 'Danh mục tin tức';
    if (pathname.startsWith('/admin/reviews')) return 'Đánh giá khóa học';
    if (pathname === '/admin') return 'Tổng quan quản trị';
    if (pathname.startsWith('/admin')) return 'Quản trị';
    if (pathname.startsWith('/account/purchases')) return 'Lịch sử mua khóa';
    if (pathname.startsWith('/account/payments')) return 'Lịch sử thanh toán';
    if (pathname.startsWith('/account/login-history')) return 'Lịch sử đăng nhập';
    if (pathname.startsWith('/account/courses')) return 'Khóa học của tôi';
    if (pathname.startsWith('/settings/security')) return 'Bảo mật tài khoản';
    if (pathname.startsWith('/settings/profile')) return 'Hồ sơ cá nhân';
    return 'Bảng điều khiển';
}

export function dashboardPageSubtitle(pathname: string): string {
    return getDashboardArea(pathname) === 'admin'
        ? 'Quản lý nội dung & vận hành hệ thống'
        : 'Quản lý tài khoản & học tập';
}
