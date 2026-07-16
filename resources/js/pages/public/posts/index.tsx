import { Head, Link, router } from '@inertiajs/react';
import {
    Container,
    Group,
    Pagination,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { Search } from 'lucide-react';
import { useState } from 'react';
import PageHero from '@/components/public/page-hero';
import PostCard from '@/components/public/post-card';
import type { PaginatedPosts, PostCategory, PostFilters } from '@/types';

type Props = {
    posts: PaginatedPosts;
    categories: PostCategory[];
    filters: PostFilters;
    activeCategory: PostCategory | null;
};

export default function PostsIndex({
    posts,
    categories,
    filters,
    activeCategory,
}: Props) {
    const [search, setSearch] = useState(filters.q);
    const basePath = activeCategory
        ? `/tin-tuc/danh-muc/${activeCategory.slug}`
        : '/tin-tuc';

    const applyFilters = (next: Partial<PostFilters & { page?: number }>) => {
        router.get(
            basePath,
            { ...filters, ...next },
            { preserveState: true, replace: true },
        );
    };

    const debouncedSearch = useDebouncedCallback((value: string) => {
        applyFilters({ q: value, page: 1 });
    }, 350);

    return (
        <>
            <Head title={activeCategory ? activeCategory.name : 'Tin tức'} />

            <PageHero
                title={activeCategory?.name ?? 'Tin tức'}
                subtitle={
                    activeCategory?.description ??
                    'Cập nhật kiến thức, hướng nghiệp và tin tức từ Học Viện Bông Nhài Trắng.'
                }
            />

            <Container size="xl" py={48}>
                <Stack gap="xl">
                    {!activeCategory && (
                        <Group align="flex-end" grow preventGrowOverflow={false} wrap="wrap">
                            <TextInput
                                label="Tìm kiếm"
                                placeholder="Tiêu đề bài viết..."
                                leftSection={<Search size={16} />}
                                value={search}
                                onChange={(event) => {
                                    const value = event.currentTarget.value;
                                    setSearch(value);
                                    debouncedSearch(value);
                                }}
                                style={{ flex: '1 1 280px' }}
                            />
                            <Select
                                label="Danh mục"
                                placeholder="Tất cả"
                                clearable
                                data={categories.map((category) => ({
                                    value: category.slug,
                                    label: category.name,
                                }))}
                                value={filters.category || null}
                                onChange={(value) => {
                                    if (value) {
                                        router.get(`/tin-tuc/danh-muc/${value}`);
                                    } else {
                                        router.get('/tin-tuc');
                                    }
                                }}
                                style={{ flex: '1 1 220px' }}
                            />
                        </Group>
                    )}

                    {activeCategory && (
                        <Text size="sm" c="dimmed">
                            <Link href="/tin-tuc">← Tất cả tin tức</Link>
                        </Text>
                    )}

                    <Text size="sm" c="dimmed">
                        {posts.total} bài viết
                    </Text>

                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                        {posts.data.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </SimpleGrid>

                    {posts.data.length === 0 && (
                        <Stack align="center" py={64} gap="sm">
                            <Text fw={500}>Chưa có bài viết</Text>
                            <Text c="dimmed" size="sm">
                                Thử đổi từ khóa hoặc danh mục khác.
                            </Text>
                        </Stack>
                    )}

                    {posts.last_page > 1 && (
                        <Group justify="center">
                            <Pagination
                                total={posts.last_page}
                                value={posts.current_page}
                                onChange={(page) => applyFilters({ page })}
                            />
                        </Group>
                    )}
                </Stack>
            </Container>
        </>
    );
}
