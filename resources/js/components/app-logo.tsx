import BrandLogo from '@/components/public/brand-logo';
import { useSiteConfig } from '@/hooks/use-site-config';

export default function AppLogo() {
    const site = useSiteConfig();

    return (
        <>
            <div className="flex size-10 shrink-0 items-center justify-center">
                <BrandLogo height={36} maxWidth={28} />
            </div>
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="truncate leading-tight font-semibold">
                    {site.shortName}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    E-Learning
                </span>
            </div>
        </>
    );
}
