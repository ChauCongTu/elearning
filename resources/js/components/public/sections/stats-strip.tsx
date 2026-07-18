import { Box, Container, SimpleGrid, Text, Title } from '@mantine/core';
import type { SiteStat } from '@/types';

type Props = {
    stats: SiteStat[];
};

export default function StatsStrip({ stats }: Props) {
    return (
        <Box py={56} className="public-stat-band" style={{ position: 'relative', zIndex: 1 }}>
            <Container size="xl" style={{ position: 'relative', zIndex: 1 }}>
                <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
                    {stats.map((stat) => (
                        <Box key={stat.label} className="public-stat-pill">
                            <Title order={2} c="brand.7" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
                                {stat.value}
                            </Title>
                            <Text size="sm" c="dimmed" mt={6} fw={500}>
                                {stat.label}
                            </Text>
                        </Box>
                    ))}
                </SimpleGrid>
            </Container>
        </Box>
    );
}
