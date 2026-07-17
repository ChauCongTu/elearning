import { Head, Link } from '@inertiajs/react';
import {
    Badge,
    Box,
    Container,
    Grid,
    Group,
    Paper,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { Calendar, User } from 'lucide-react';
import HotlineCta from '@/components/public/sections/hotline-cta';
import PostCard from '@/components/public/post-card';
import { courseGradient, mediaUrl } from '@/lib/format';
import type { PostDetail, PostSummary } from '@/types';

type Props = {
    post: PostDetail;
    relatedPosts: PostSummary[];
};

function formatDate(value: string | null): string {
    if (!value) {
        return '';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(value));
}

export default function PostShow({ post, relatedPosts }: Props) {
    const featuredImage = mediaUrl(post.featured_image);

    return (
        <>
            <Head title={post.title} />

            {featuredImage && (
                <Box
                    h={{ base: 220, md: 320 }}
                    style={{
                        background: `linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${featuredImage}) center/cover no-repeat`,
                    }}
                />
            )}

            <Box
                py={48}
                style={{
                    background: featuredImage
                        ? '#fff'
                        : 'linear-gradient(135deg, var(--mantine-color-pink-0) 0%, #fff 60%)',
                    borderBottom: '1px solid var(--mantine-color-gray-2)',
                }}
            >
                <Container size="md">
                    <Stack gap="md">
                        {post.category && (
                            <Badge
                                component={Link}
                                href={`/tin-tuc/danh-muc/${post.category.slug}`}
                                variant="light"
                                color="pink"
                                w="fit-content"
                                style={{ textDecoration: 'none' }}
                            >
                                {post.category.name}
                            </Badge>
                        )}
                        <Title order={1}>{post.title}</Title>
                        {post.excerpt && (
                            <Text size="lg" c="dimmed" style={{ lineHeight: 1.7 }}>
                                {post.excerpt}
                            </Text>
                        )}
                        <Group gap="lg">
                            <Group gap={6}>
                                <Calendar size={16} />
                                <Text size="sm" c="dimmed">
                                    {formatDate(post.published_at)}
                                </Text>
                            </Group>
                            {post.author_name && (
                                <Group gap={6}>
                                    <User size={16} />
                                    <Text size="sm" c="dimmed">
                                        {post.author_name}
                                    </Text>
                                </Group>
                            )}
                        </Group>
                    </Stack>
                </Container>
            </Box>

            <Container size="md" py={48}>
                <Grid gap="xl">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Paper withBorder radius="lg" p={{ base: 'lg', md: 'xl' }}>
                            <Box
                                className="post-content"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </Paper>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack gap="lg">
                            <Paper withBorder radius="lg" p="lg">
                                <Title order={5} mb="sm">
                                    Cần tư vấn học nghề?
                                </Title>
                                <Text size="sm" c="dimmed" mb="md">
                                    Liên hệ Học Viện Bông Nhài Trắng để được tư vấn lộ trình
                                    phù hợp với hoàn cảnh của bạn.
                                </Text>
                                <Text
                                    component={Link}
                                    href="/lien-he"
                                    size="sm"
                                    c="pink.7"
                                    fw={600}
                                >
                                    Đăng ký tư vấn miễn phí →
                                </Text>
                            </Paper>

                            {relatedPosts.length > 0 && (
                                <Stack gap="md">
                                    <Title order={4}>Bài viết cùng chủ đề</Title>
                                    {relatedPosts.slice(0, 4).map((related) => (
                                        <PostCard key={related.id} post={related} />
                                    ))}
                                </Stack>
                            )}
                        </Stack>
                    </Grid.Col>
                </Grid>
            </Container>

            <HotlineCta />
        </>
    );
}
