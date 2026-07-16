import { Link } from '@inertiajs/react';
import { Button, Card, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { Sparkles } from 'lucide-react';
import SectionHeading from '@/components/public/section-heading';
import type { ServiceItem } from '@/types';

type Props = {
    services: ServiceItem[];
};

export default function ServiceHighlights({ services }: Props) {
    return (
        <Container size="xl" py={64}>
            <SectionHeading
                title="Dịch vụ nổi bật"
                description="Trải nghiệm dịch vụ thẩm mỹ cao cấp — nơi vẻ đẹp được chăm chút bằng tay nghề và tâm huyết."
                align="center"
            />
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {services.map((service) => (
                    <Card key={service.title} padding="lg" radius="lg" withBorder>
                        <Stack gap="sm">
                            <Sparkles size={20} color="var(--mantine-color-pink-6)" />
                            <Title order={5}>{service.title}</Title>
                            <Text size="sm" c="dimmed">
                                {service.description}
                            </Text>
                            <Button
                                component="a"
                                href="#tu-van"
                                variant="subtle"
                                color="pink"
                                size="xs"
                                w="fit-content"
                            >
                                Nhận tư vấn
                            </Button>
                        </Stack>
                    </Card>
                ))}
            </SimpleGrid>
        </Container>
    );
}
