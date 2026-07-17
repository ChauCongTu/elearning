import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-gray-100 bg-white/80 px-4 backdrop-blur-sm md:px-6">
            <div className="flex min-w-0 items-center gap-2">
                <SidebarTrigger className="-ml-1 text-gray-600" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <Button
                variant="outline"
                size="sm"
                asChild
                className="shrink-0 border-gray-200 text-gray-700 hover:bg-pink-50 hover:text-pink-700"
            >
                <Link href="/">
                    <ArrowLeft className="mr-2 size-4" />
                    Về trang chủ
                </Link>
            </Button>
        </header>
    );
}
