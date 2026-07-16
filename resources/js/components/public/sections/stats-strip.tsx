import { Box, Container, SimpleGrid, Text, Title } from '@mantine/core';
import type { SiteStat } from '@/types';

type Props = {
    stats: SiteStat[];
};

export default function StatsStrip({ stats }: Props) {
    return (
        <Box py={56} className="public-mesh" style={{ background: 'var(--brand-gradient)' }}>
            <Container size="xl">
                <SimpleGrid cols={{ base: 2, md: 4 }} spacing="lg">
                    {stats.map((stat) => (
                        <Box
                            key={stat.label}
                            className="public-glass public-card-hover"
                            p="lg"
                            style={{
                                borderRadius: 20,
                                textAlign: 'center',
                            }}
                        >
                            <Title order={2} className="public-gradient-text">
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
