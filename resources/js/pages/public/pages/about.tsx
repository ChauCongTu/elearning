import { Head } from '@inertiajs/react';
import { Container, Stack } from '@mantine/core';
import AboutAcademy from '@/components/public/sections/about-academy';
import FounderSpotlight from '@/components/public/sections/founder-spotlight';
import StatsStrip from '@/components/public/sections/stats-strip';
import VideoGallery from '@/components/public/sections/video-gallery';
import WhyChooseUs from '@/components/public/sections/why-choose-us';
import PageHero from '@/components/public/page-hero';
import type { SiteContent } from '@/types';

type Props = {
    siteContent: SiteContent;
};

export default function AboutPage({ siteContent }: Props) {
    return (
        <>
            <Head title="Về chúng tôi" />

            <PageHero
                title="Về chúng tôi"
                subtitle={siteContent.about.headline}
            />

            <Container size="xl" py={32}>
                <Stack gap={0}>
                    <AboutAcademy content={siteContent.about} />
                    <StatsStrip stats={siteContent.stats} />
                    <WhyChooseUs items={siteContent.why_choose_us} />
                    <FounderSpotlight founder={siteContent.founder} />
                    <VideoGallery videos={siteContent.videos} />
                </Stack>
            </Container>
        </>
    );
}
