import { Head, usePage } from '@inertiajs/react';
import { absoluteUrl, truncateDescription } from '@/lib/seo';
import type { SiteSettings } from '@/types/site-settings';

type Props = {
    title: string;
    description: string;
    canonicalPath: string;
    image?: string | null;
    type?: 'website' | 'article';
    noIndex?: boolean;
};

export default function SeoHead({
    title,
    description,
    canonicalPath,
    image,
    type = 'website',
    noIndex = false,
}: Props) {
    const { appUrl, siteSettings, name: siteName } = usePage<{
        appUrl: string;
        siteSettings: SiteSettings;
        name: string;
    }>().props;

    const metaDescription = truncateDescription(description);
    const canonicalUrl = absoluteUrl(appUrl, canonicalPath) ?? canonicalPath;
    const ogImage =
        absoluteUrl(appUrl, image) ?? absoluteUrl(appUrl, siteSettings.logoUrl);
    const fullTitle = `${title} - ${siteName}`;

    return (
        <Head title={title}>
            <meta head-key="description" name="description" content={metaDescription} />
            <link head-key="canonical" rel="canonical" href={canonicalUrl} />
            {noIndex && (
                <meta head-key="robots" name="robots" content="noindex, nofollow" />
            )}
            <meta head-key="og:title" property="og:title" content={fullTitle} />
            <meta
                head-key="og:description"
                property="og:description"
                content={metaDescription}
            />
            <meta head-key="og:url" property="og:url" content={canonicalUrl} />
            <meta head-key="og:type" property="og:type" content={type} />
            <meta head-key="og:locale" property="og:locale" content="vi_VN" />
            {ogImage && (
                <meta head-key="og:image" property="og:image" content={ogImage} />
            )}
            <meta
                head-key="twitter:card"
                name="twitter:card"
                content="summary_large_image"
            />
            <meta head-key="twitter:title" name="twitter:title" content={fullTitle} />
            <meta
                head-key="twitter:description"
                name="twitter:description"
                content={metaDescription}
            />
            {ogImage && (
                <meta head-key="twitter:image" name="twitter:image" content={ogImage} />
            )}
        </Head>
    );
}
