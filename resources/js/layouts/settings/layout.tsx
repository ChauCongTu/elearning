import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';

const settingsLinks = [
    { title: 'Hồ sơ cá nhân', href: edit() },
    { title: 'Bảo mật', href: editSecurity() },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();

    return (
        <div>
            <Heading title="Cài đặt tài khoản" description="Quản lý hồ sơ và bảo mật." />

            <div className="dashboard-settings-grid mt-6">
                <aside>
                    <nav className="dashboard-settings-nav" aria-label="Cài đặt">
                        {settingsLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="dashboard-settings-link"
                                data-active={isCurrentOrParentUrl(link.href) ? 'true' : undefined}
                            >
                                {link.title}
                            </Link>
                        ))}
                    </nav>
                </aside>

                <section className="min-w-0">{children}</section>
            </div>
        </div>
    );
}
