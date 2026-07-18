import { Container, Grid, Image, Paper, Stack, Text, Title } from '@mantine/core';
import type { AboutContent } from '@/types';

type Props = {
    content: AboutContent;
};

export default function AboutAcademy({ content }: Props) {
    return (
        <Container size="xl" py={72}>
            <Grid align="center" gutter="xl">
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Stack gap="md">
                        <span className="public-kicker">{content.eyebrow}</span>
                        <Title order={2} lh={1.15}>
                            {content.headline}
                        </Title>
                        <Title order={4} c="dimmed" fw={600}>
                            {content.story_title}
                        </Title>
                        <Text c="dimmed" lh={1.8}>
                            {content.story}
                        </Text>
                        <Paper p="lg" radius="xl" className="public-soft-card">
                            <Text lh={1.8}>{content.mission}</Text>
                        </Paper>
                    </Stack>
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Paper radius="xl" p={0} className="public-soft-card public-card-hover" style={{ overflow: 'hidden' }}>
                        <Image
                            src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&auto=format&fit=crop"
                            alt="Học viện thẩm mỹ"
                            h={380}
                            fit="cover"
                            fallbackSrc="https://placehold.co/800x380/fff0f6/e64980?text=Hoc+Vien"
                        />
                    </Paper>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
