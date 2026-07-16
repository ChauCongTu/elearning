import { Head } from '@inertiajs/react';
import { Container, Stack, Text } from '@mantine/core';
import ContactChannels from '@/components/public/contact-channels';
import ConsultationSection from '@/components/public/sections/consultation-section';
import PageHero from '@/components/public/page-hero';
import type { SiteContent } from '@/types';

type Props = {
    siteContent: SiteContent;
};

export default function ContactPage({ siteContent }: Props) {
    return (
        <>
            <Head title="Liên hệ" />

            <PageHero title="Liên hệ" subtitle={siteContent.contact.intro} />

            <Container size="xl" py={48}>
                <Stack gap={48}>
                    <ContactChannels contact={siteContent.contact} />
                    <Text ta="center" c="dimmed" size="sm">
                        Đội ngũ luôn sẵn sàng lắng nghe ý kiến của quý học viên. Gửi yêu
                        cầu qua form bên dưới để được phản hồi sớm nhất.
                    </Text>
                </Stack>
            </Container>

            <ConsultationSection config={siteContent.consultation} />
        </>
    );
}
