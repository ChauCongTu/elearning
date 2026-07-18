import { Link } from '@inertiajs/react';
import { Box, Container, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import { ArrowRight } from 'lucide-react';
import PostCard from '@/components/public/post-card';
import type { ArticleSection } from '@/types';

type Props = {
    sections: ArticleSection[];
};

export default function ArticleTeasers({ sections }: Props) {
    const visibleSections = sections.filter((section) => section.articles.length > 0);

    if (visibleSections.length === 0) {
        return null;
    }

    return (
        <Box py={72} style={{ background: 'rgba(255,255,255,0.65)' }}>
            <Container size="xl">
                <Stack gap={56}>
                    {visibleSections.map((section) => (
                        <div key={section.key}>
                            <Group justify="space-between" align="flex-end" mb="xl" wrap="wrap" gap="md">
                                <Stack gap="xs">
                                    <span className="public-kicker">Tin tức</span>
                                    <Title order={3}>{section.title}</Title>
                                </Stack>
                                <Link href={section.view_all_url} className="public-nav-link">
                                    <Text
                                        size="sm"
                                        fw={700}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--brand-primary-dark)' }}
                                    >
                                        Xem tất cả <ArrowRight size={16} />
                                    </Text>
                                </Link>
                            </Group>
                            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                                {section.articles.map((article) => (
                                    <PostCard
                                        key={article.slug ?? article.title}
                                        post={{
                                            id: '0',
                                            post_category_id: null,
                                            title: article.title,
                                            slug: article.slug ?? article.url.split('/').pop() ?? '',
                                            excerpt: article.excerpt,
                                            featured_image: article.featured_image ?? null,
                                            author_name: null,
                                            is_featured: false,
                                            published_at: article.published_at ?? null,
                                        }}
                                    />
                                ))}
                            </SimpleGrid>
                        </div>
                    ))}
                </Stack>
            </Container>
        </Box>
    );
}
