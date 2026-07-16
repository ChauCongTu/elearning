import { Box, Container, Grid, Image, Paper, Stack, Text, Title } from '@mantine/core';
import type { AboutContent } from '@/types';

type Props = {
    content: AboutContent;
};

export default function AboutAcademy({ content }: Props) {
    return (
        <Container size="xl" py={64}>
            <Grid align="center" gap="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="md">
                        <Text size="sm" fw={700} c="pink.7" tt="uppercase">
                            {content.eyebrow}
                        </Text>
                        <Title order={2}>{content.headline}</Title>
                        <Title order={4} c="dimmed">
                            {content.story_title}
                        </Title>
                        <Text c="dimmed" style={{ lineHeight: 1.7 }}>
                            {content.story}
                        </Text>
                        <Text style={{ lineHeight: 1.7 }}>{content.mission}</Text>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper radius="xl" withBorder p={0} style={{ overflow: 'hidden' }}>
                        <Image
                            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop"
                            alt="Học viện thẩm mỹ"
                            h={360}
                            fallbackSrc="https://placehold.co/800x360/fce7f3/9d174d?text=Hoc+Vien"
                        />
                    </Paper>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
