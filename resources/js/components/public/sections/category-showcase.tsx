import { Link } from '@inertiajs/react';
import { Button, Card, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/public/section-heading';
import type { CategoryShowcaseItem } from '@/types';

type Props = {
    items: CategoryShowcaseItem[];
};

export default function CategoryShowcase({ items }: Props) {
    return (
        <Container size="xl" py={64}>
            <SectionHeading
                title="Lĩnh vực đào tạo"
                description="Khám phá các chương trình đào tạo theo từng chuyên môn."
            />
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                {items.map((item) => (
                    <Card
                        key={item.title}
                        padding="xl"
                        radius="lg"
                        style={{
                            background:
                                'linear-gradient(135deg, #fff 0%, #fff5f8 100%)',
                        }}
                    >
                        <Stack gap="md">
                            <Title order={3}>{item.title}</Title>
                            <Text c="dimmed">{item.description}</Text>
                            <Button
                                component={Link}
                                href={`/courses?category=${item.slug}`}
                                variant="light"
                                color="pink"
                                rightSection={<ArrowRight size={16} />}
                                w="fit-content"
                            >
                                Tìm hiểu thêm
                            </Button>
                        </Stack>
                    </Card>
                ))}
            </SimpleGrid>
        </Container>
    );
}
