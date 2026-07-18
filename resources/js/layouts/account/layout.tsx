import { Link } from '@inertiajs/react';
import {
    CreditCard,
    GraduationCap,
    History,
    ShoppingBag,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { toUrl } from '@/lib/utils';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

const accountTabs: NavItem[] = [
    {
        title: 'Khóa học của tôi',
        href: '/account/courses',
        icon: GraduationCap,
    },
    {
        title: 'Lịch sử mua khóa',
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

export default function AccountLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();

    return (
        <div className="app-shell-page">
            <div className="app-shell-content">
                <nav className="app-shell-nav" aria-label="Tài khoản học viên">
                    {accountTabs.map((tab) => (
                        <Link
                            key={toUrl(tab.href)}
                            href={tab.href}
                            prefetch
                            className="app-shell-nav-link"
                            data-active={isCurrentUrl(tab.href) ? 'true' : undefined}
                        >
                            {tab.icon && <tab.icon className="size-4 shrink-0" />}
                            {tab.title}
                        </Link>
                    ))}
                </nav>

                <div className="app-shell-card">{children}</div>
            </div>
        </div>
    );
}
