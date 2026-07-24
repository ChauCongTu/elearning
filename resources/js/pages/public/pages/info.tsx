import { Head } from '@inertiajs/react';
import { Container, Paper, Stack, Text, Title } from '@mantine/core';
import HotlineCta from '@/components/public/sections/hotline-cta';
import StudentLookupSection from '@/components/public/sections/student-lookup-section';
import PageHero from '@/components/public/page-hero';
import type { SiteContent, StudentLookupResult } from '@/types';

type Props = {
    siteContent: SiteContent;
    lookupQuery: string;
    lookupResults: StudentLookupResult[];
};

export default function InfoPage({ siteContent, lookupQuery, lookupResults }: Props) {
    return (
        <>
            <Head title="Thông tin">
                {lookupQuery !== '' && <meta name="robots" content="noindex, nofollow" />}
            </Head>

            <PageHero title="Thông tin" subtitle={siteContent.info.intro} />

            <Container size="xl" py={48}>
                <Stack gap="lg">
                    <StudentLookupSection query={lookupQuery} results={lookupResults} />

                    {siteContent.info.sections.map((section) => (
                        <Paper key={section.title} withBorder radius="lg" p="xl">
                            <Title order={3} mb="md">
                                {section.title}
                            </Title>
                            <Text
                                c="dimmed"
                                style={{ lineHeight: 1.8, whiteSpace: 'pre-line' }}
                            >
                                {section.content}
                            </Text>
                        </Paper>
                    ))}
                </Stack>
            </Container>

            <HotlineCta />
        </>
    );
}
