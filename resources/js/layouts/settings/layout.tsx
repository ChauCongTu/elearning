import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { NavItem } from '@/types';

const sidebarNavItems: NavItem[] = [
    {
        title: 'Hồ sơ cá nhân',
        href: edit(),
        icon: null,
    },
    {
        title: 'Bảo mật',
        href: editSecurity(),
        icon: null,
    },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div className="account-shell min-h-full px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto w-full max-w-5xl">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-8">
                    <Heading
                        title="Cài đặt tài khoản"
                        description="Quản lý hồ sơ và bảo mật."
                    />

                    <div className="mt-6 flex flex-col lg:flex-row lg:gap-10">
                        <aside className="w-full lg:w-52">
                            <nav
                                className="flex flex-col gap-1"
                                aria-label="Cài đặt"
                            >
                                {sidebarNavItems.map((item, index) => (
                                    <Button
                                        key={`${toUrl(item.href)}-${index}`}
                                        size="sm"
                                        variant="ghost"
                                        asChild
                                        className={cn(
                                            'w-full justify-start rounded-lg text-gray-600',
                                            {
                                                'bg-pink-50 font-medium text-pink-700':
                                                    isCurrentOrParentUrl(item.href),
                                            },
                                        )}
                                    >
                                        <Link href={item.href}>{item.title}</Link>
                                    </Button>
                                ))}
                            </nav>
                        </aside>

                        <Separator className="my-6 lg:hidden" />

                        <div className="min-w-0 flex-1">
                            <section className="max-w-xl space-y-8">{children}</section>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
