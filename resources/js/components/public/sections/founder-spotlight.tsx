import { Avatar, Box, Button, Container, Grid, List, Paper, Stack, Text, Title } from '@mantine/core';
import { useSiteConfig } from '@/hooks/use-site-config';
import type { FounderContent } from '@/types';

type Props = {
    founder: FounderContent;
};

export default function FounderSpotlight({ founder }: Props) {
    const site = useSiteConfig();

    return (
        <Box py={72} className="public-surface-alt">
            <Container size="xl">
                <Grid align="center" gutter="xl">
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Paper radius="xl" p="xl" className="public-soft-card" ta="center">
                            <Avatar
                                size={120}
                                radius="xl"
                                mx="auto"
                                color="brand"
                                variant="gradient"
                                gradient={{ from: 'pink', to: 'grape', deg: 135 }}
                            >
                                {founder.name
                                    .split(' ')
                                    .map((w) => w[0])
                                    .join('')
                                    .slice(-2)}
                            </Avatar>
                            <Title order={3} mt="md">
                                {founder.name}
                            </Title>
                            <Text size="sm" fw={700} style={{ color: 'var(--brand-primary-dark)' }}>
                                {founder.title}
                            </Text>
                            <Text size="xs" c="dimmed" mt={4}>
                                {founder.subtitle}
                            </Text>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Stack gap="md">
                            <span className="public-kicker">Người sáng lập</span>
                            <Title order={2}>{founder.subtitle}</Title>
                            <Text c="dimmed" lh={1.8}>
                                {founder.bio}
                            </Text>
                            <List spacing="xs" size="sm">
                                {founder.achievements.map((item) => (
                                    <List.Item key={item}>{item}</List.Item>
                                ))}
                            </List>
                            <Button
                                component="a"
                                href={site.zaloUrl}
                                target="_blank"
                                color="brand"
                                radius="xl"
                                w="fit-content"
                                style={{ background: 'var(--brand-gradient)', border: 'none' }}
                            >
                                Kết nối với {founder.name.split(' ').slice(-2).join(' ')}
                            </Button>
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Container>
        </Box>
    );
}
