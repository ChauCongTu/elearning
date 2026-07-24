import { Link } from '@inertiajs/react';
import { Box, Button, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/public/section-heading';
import type { CategoryShowcaseItem } from '@/types';

type Props = {
    items: CategoryShowcaseItem[];
};

export default function CategoryShowcase({ items }: Props) {
    return (
        <Box py={72} className="public-surface-alt">
            <Container size="xl">
                <SectionHeading title="Lĩnh vực đào tạo" />
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                    {items.map((item) => (
                        <Stack
                            key={item.title}
                            gap="md"
                            p="xl"
                            className="public-soft-card public-card-hover"
                        >
                            <Title order={3}>{item.title}</Title>
                            <Text c="dimmed" lh={1.75}>
                                {item.description}
                            </Text>
                            <Button
                                component={Link}
                                href={`/courses?category=${item.slug}`}
                                variant="light"
                                color="brand"
                                rightSection={<ArrowRight size={16} />}
                                w="fit-content"
                                radius="xl"
                            >
                                Tìm hiểu thêm
                            </Button>
                        </Stack>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}
