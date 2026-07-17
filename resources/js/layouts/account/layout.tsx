import { Link } from '@inertiajs/react';
import {
    CreditCard,
    GraduationCap,
    History,
    ShoppingBag,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { cn, toUrl } from '@/lib/utils';
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
        <div className="account-shell min-h-full flex-1 px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-5xl">
                <nav
                    className="mb-6 flex flex-wrap gap-2"
                    aria-label="Tài khoản học viên"
                >
                    {accountTabs.map((tab) => (
                        <Link
                            key={toUrl(tab.href)}
                            href={tab.href}
                            prefetch
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                                isCurrentUrl(tab.href)
                                    ? 'border-pink-200 bg-pink-50 text-pink-700 shadow-sm'
                                    : 'border-transparent bg-white text-gray-600 hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900',
                            )}
                        >
                            {tab.icon && <tab.icon className="size-4 shrink-0" />}
                            {tab.title}
                        </Link>
                    ))}
                </nav>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
