import { Link } from '@inertiajs/react';
import { Badge, Box, Card, Group, Stack, Text, Title } from '@mantine/core';
import { ArrowUpRight, Calendar } from 'lucide-react';
import { courseGradient, mediaUrl } from '@/lib/format';
import type { PostSummary } from '@/types';

type Props = {
    post: PostSummary;
    compact?: boolean;
};

function formatDate(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(value));
}

export default function PostCard({ post, compact = false }: Props) {
    const image = mediaUrl(post.featured_image, post.featured_image_url);
    const imageHeight = compact ? 140 : 180;
    const excerptLines = compact ? 2 : 3;

    return (
        <Card
            component={Link}
            href={`/tin-tuc/${post.slug}`}
            padding={0}
            radius="xl"
            className="public-soft-card public-card-hover"
            style={{ textDecoration: 'none', color: 'inherit', height: '100%', overflow: 'hidden' }}
        >
            <Box
                h={imageHeight}
                style={{
                    background: image
                        ? `linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.45) 100%), url(${image}) center/cover no-repeat`
                        : courseGradient(post.slug),
                }}
            />
            <Stack gap="sm" p={compact ? 'md' : 'lg'} h="100%">
                {post.category && (
                    <Badge variant="light" color="brand" w="fit-content">
                        {post.category.name}
                    </Badge>
                )}
                <Title order={compact ? 5 : 4} lineClamp={2} lh={1.35}>
                    {post.title}
                </Title>
                {post.excerpt && (
                    <Text size="sm" c="dimmed" lineClamp={excerptLines} style={{ flex: 1 }} lh={1.55}>
                        {post.excerpt}
                    </Text>
                )}
                <Group justify="space-between" mt="auto" pt="sm">
                    <Group gap={6}>
                        <Calendar size={14} color="var(--mantine-color-dimmed)" />
                        <Text size="xs" c="dimmed">
                            {formatDate(post.published_at)}
                        </Text>
                    </Group>
                    <ArrowUpRight size={16} color="var(--brand-primary)" />
                </Group>
            </Stack>
        </Card>
    );
}
