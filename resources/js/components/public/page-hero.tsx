import { Box, Container, Stack, Text, Title } from '@mantine/core';

type Props = {
    title: string;
    subtitle?: string;
    eyebrow?: string;
};

export default function PageHero({ title, subtitle, eyebrow = 'Học Viện Bông Nhài Trắng' }: Props) {
    return (
        <Box py={56} className="public-soft-mesh" style={{ background: 'var(--brand-gradient-soft)' }}>
            <Container size="xl">
                <Stack gap="md" maw={760} className="public-fade-up">
                    <span className="public-kicker">{eyebrow}</span>
                    <Title
                        order={1}
                        fw={800}
                        style={{
                            fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
                            lineHeight: 1.12,
                        }}
                    >
                        <span className="public-gradient-text">{title}</span>
                    </Title>
                    {subtitle && (
                        <Text size="lg" c="dimmed" lh={1.75}>
                            {subtitle}
                        </Text>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}
