import { Head } from '@inertiajs/react';
import { Container, Paper, Stack, Text, Title } from '@mantine/core';
import HotlineCta from '@/components/public/sections/hotline-cta';
import PageHero from '@/components/public/page-hero';
import type { SiteContent } from '@/types';

type Props = {
    siteContent: SiteContent;
};

export default function InfoPage({ siteContent }: Props) {
    return (
        <>
            <Head title="Thông tin" />

            <PageHero title="Thông tin" subtitle={siteContent.info.intro} />

            <Container size="xl" py={48}>
                <Stack gap="lg">
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
