import { Avatar, Box, Button, Container, Grid, List, Paper, Stack, Text, Title } from '@mantine/core';
import { useSiteConfig } from '@/hooks/use-site-config';
import type { FounderContent } from '@/types';

type Props = {
    founder: FounderContent;
};

export default function FounderSpotlight({ founder }: Props) {
    const site = useSiteConfig();

    return (
        <Box py={64} style={{ background: 'var(--mantine-color-gray-0)' }}>
            <Container size="xl">
                <Grid align="center" gap="xl">
                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Paper radius="xl" p="xl" withBorder ta="center">
                            <Avatar
                                size={120}
                                radius="xl"
                                mx="auto"
                                color="pink"
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
                            <Text size="sm" c="pink.7" fw={600}>
                                {founder.title}
                            </Text>
                            <Text size="xs" c="dimmed" mt={4}>
                                {founder.subtitle}
                            </Text>
                        </Paper>
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Stack gap="md">
                            <Text size="sm" fw={700} c="pink.7" tt="uppercase">
                                Người sáng lập
                            </Text>
                            <Title order={2}>{founder.subtitle}</Title>
                            <Text c="dimmed" style={{ lineHeight: 1.7 }}>
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
                                color="pink"
                                w="fit-content"
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
