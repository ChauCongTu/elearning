import { Head, Link } from '@inertiajs/react';
import { Button, Group, Select, Table, Text, TextInput } from '@mantine/core';
import { Plus, Search } from 'lucide-react';
import AdminListSwitch from '@/components/admin/admin-list-switch';
import AdminPageHeader from '@/components/admin/admin-page-header';
import AdminPagination from '@/components/admin/admin-pagination';
import { useAdminFilterForm } from '@/hooks/use-admin-filter-form';
import { applyAdminFilters, FILTER_ALL } from '@/lib/admin-list';
import type { AdminPostCategory, AdminPostListItem, Paginated } from '@/types';

type Props = {
    posts: Paginated<AdminPostListItem>;
    categories: AdminPostCategory[];
    filters: { search?: string; post_category_id?: string };
};

export default function AdminPostsIndex({ posts, categories, filters }: Props) {
    const form = useAdminFilterForm({
        search: filters.search ?? '',
        post_category_id: filters.post_category_id ?? FILTER_ALL,
    });

    return (
        <>
            <Head title="Tin tức" />
            <AdminPageHeader
                title="Tin tức"
                description="Quản lý bài viết blog và tin tức."
                actions={
                    <Button component={Link} href="/admin/posts/create" leftSection={<Plus size={16} />}>
                        Viết bài mới
                    </Button>
                }
            />

            <div className="admin-filter-bar">
                <Group align="flex-end" wrap="wrap">
                    <TextInput
                        label="Tìm kiếm"
                        placeholder="Tiêu đề..."
                        leftSection={<Search size={16} />}
                        style={{ flex: 1, minWidth: 220 }}
                        {...form.getInputProps('search')}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                applyAdminFilters('/admin/posts', form.values);
                            }
                        }}
                    />
                    <Select
                        label="Danh mục"
                        data={[
                            { value: FILTER_ALL, label: 'Tất cả' },
                            ...categories.map((c) => ({ value: c.id, label: c.name })),
                        ]}
                        searchable
                        w={220}
                        value={form.values.post_category_id}
                        onChange={(value) => form.setFieldValue('post_category_id', value ?? FILTER_ALL)}
                        error={form.errors.post_category_id}
                    />
                    <Button onClick={() => applyAdminFilters('/admin/posts', form.values)}>Lọc</Button>
                </Group>
            </div>

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Tiêu đề</Table.Th>
                        <Table.Th>Danh mục</Table.Th>
                        <Table.Th>Xuất bản</Table.Th>
                        <Table.Th>Nổi bật</Table.Th>
                        <Table.Th />
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {posts.data.map((post) => (
                        <Table.Tr key={post.id}>
                            <Table.Td>
                                <Text fw={600} size="sm">
                                    {post.title}
                                </Text>
                                <Text size="xs" c="dimmed">
                                    {post.slug}
                                </Text>
                            </Table.Td>
                            <Table.Td>{post.category?.name ?? '—'}</Table.Td>
                            <Table.Td>
                                <AdminListSwitch
                                    url={`/admin/posts/${post.id}/toggle`}
                                    field="is_published"
                                    checked={post.is_published}
                                    label="Xuất bản bài viết"
                                    onLabel="Xuất bản"
                                    offLabel="Nháp"
                                />
                            </Table.Td>
                            <Table.Td>
                                <AdminListSwitch
                                    url={`/admin/posts/${post.id}/toggle`}
                                    field="is_featured"
                                    checked={post.is_featured}
                                    label="Bài nổi bật"
                                />
                            </Table.Td>
                            <Table.Td>
                                <Button component={Link} href={`/admin/posts/${post.id}/edit`} size="xs" variant="light">
                                    Sửa
                                </Button>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <AdminPagination paginator={posts} />
        </>
    );
}
