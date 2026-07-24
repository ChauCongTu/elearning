import { Button, Card, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Sparkles } from 'lucide-react';
import SectionHeading from '@/components/public/section-heading';
import type { ServiceItem } from '@/types';

type Props = {
    services: ServiceItem[];
};

export default function ServiceHighlights({ services }: Props) {
    return (
        <Container size="xl" py={72}>
            <SectionHeading title="Dịch vụ nổi bật" />
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {services.map((service) => (
                    <Card key={service.title} padding="lg" radius="xl" className="public-soft-card public-card-hover">
                        <Stack gap="sm">
                            <Sparkles size={20} color="var(--brand-primary)" />
                            <Title order={5}>{service.title}</Title>
                            <Text size="sm" c="dimmed" lh={1.7}>
                                {service.description}
                            </Text>
                            <Button
                                component="a"
                                href="#tu-van"
                                variant="subtle"
                                color="brand"
                                size="xs"
                                w="fit-content"
                            >
                                Nhận tư vấn →
                            </Button>
                        </Stack>
                    </Card>
                ))}
            </SimpleGrid>
        </Container>
    );
}
