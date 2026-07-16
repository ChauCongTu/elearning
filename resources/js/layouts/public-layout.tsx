import { Box } from '@mantine/core';
import type { PropsWithChildren } from 'react';
import SiteFooter from '@/components/public/site-footer';
import SiteHeader from '@/components/public/site-header';

export default function PublicLayout({ children }: PropsWithChildren) {
    return (
        <Box
            mih="100vh"
            className="public-page-bg"
            style={{ display: 'flex', flexDirection: 'column' }}
        >
            <SiteHeader />
            <Box component="main" style={{ flex: 1 }}>
                {children}
            </Box>
            <SiteFooter />
        </Box>
    );
}
