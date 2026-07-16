import { Box, Container, Stack, Text, Title } from '@mantine/core';

type Props = {
    title: string;
    subtitle?: string;
    eyebrow?: string;
};

export default function PageHero({ title, subtitle, eyebrow = 'Học Viện Bông Nhài Trắng' }: Props) {
    return (
        <Box
            py={56}
            className="public-mesh"
            style={{
                background: 'var(--brand-gradient-soft)',
                borderBottom: '1px solid rgba(230, 73, 128, 0.08)',
            }}
        >
            <Container size="xl">
                <Stack gap="md" maw={760} className="public-fade-up">
                    <span className="public-eyebrow">{eyebrow}</span>
                    <Title
                        order={1}
                        style={{
                            fontSize: 'clamp(1.85rem, 4vw, 2.75rem)',
                            lineHeight: 1.15,
                        }}
                    >
                        <span className="public-gradient-text">{title}</span>
                    </Title>
                    {subtitle && (
                        <Text size="lg" c="dimmed" style={{ lineHeight: 1.7 }}>
                            {subtitle}
                        </Text>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}
