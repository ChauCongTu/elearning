import { Head, Link } from '@inertiajs/react';
import { Button, Group, Select, Stack, Table, Text, TextInput } from '@mantine/core';
import { BookOpen, Plus, Search } from 'lucide-react';
import AdminListSwitch from '@/components/admin/admin-list-switch';
import AdminPageHeader from '@/components/admin/admin-page-header';
import AdminPagination from '@/components/admin/admin-pagination';
import { useAdminFilterForm } from '@/hooks/use-admin-filter-form';
import { applyAdminFilters, FILTER_ALL } from '@/lib/admin-list';
import { courseThumbnailUrl, formatPrice } from '@/lib/format';
import type { AdminCourseListItem, Paginated } from '@/types';

type Props = {
    courses: Paginated<AdminCourseListItem>;
    filters: { search?: string; is_published?: string };
};

export default function AdminCoursesIndex({ courses, filters }: Props) {
    const form = useAdminFilterForm({
        search: filters.search ?? '',
        is_published: filters.is_published ?? FILTER_ALL,
    });

    return (
        <>
            <Head title="Khóa học" />
            <AdminPageHeader
                title="Khóa học"
                description="Quản lý nội dung, giá và trạng thái xuất bản."
                actions={
                    <Button component={Link} href="/admin/courses/create" leftSection={<Plus size={16} />}>
                        Thêm khóa học
                    </Button>
                }
            />

            <div className="admin-filter-bar">
                <Group align="flex-end" wrap="wrap">
                    <TextInput
                        label="Tìm kiếm"
                        placeholder="Tên hoặc slug..."
                        leftSection={<Search size={16} />}
                        style={{ flex: 1, minWidth: 220 }}
                        {...form.getInputProps('search')}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                applyAdminFilters('/admin/courses', form.values);
                            }
                        }}
                    />
                    <Select
                        label="Trạng thái"
                        data={[
                            { value: FILTER_ALL, label: 'Tất cả' },
                            { value: '1', label: 'Đang bán' },
                            { value: '0', label: 'Nháp' },
                        ]}
                        w={160}
                        value={form.values.is_published}
                        onChange={(value) => form.setFieldValue('is_published', value ?? FILTER_ALL)}
                        error={form.errors.is_published}
                    />
                    <Button onClick={() => applyAdminFilters('/admin/courses', form.values)}>Lọc</Button>
                </Group>
            </div>

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Khóa học</Table.Th>
                        <Table.Th>Danh mục</Table.Th>
                        <Table.Th>Giá</Table.Th>
                        <Table.Th>Xuất bản</Table.Th>
                        <Table.Th>Nổi bật</Table.Th>
                        <Table.Th />
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {courses.data.map((course) => {
                        const thumb = courseThumbnailUrl(course.thumbnail_path, course.slug);
                        return (
                            <Table.Tr key={course.id}>
                                <Table.Td>
                                    <Group gap="sm" wrap="nowrap">
                                        {thumb ? (
                                            <img src={thumb} alt="" className="h-10 w-14 rounded object-cover" />
                                        ) : (
                                            <div className="flex h-10 w-14 items-center justify-center rounded bg-violet-50">
                                                <BookOpen size={16} className="text-violet-500" />
                                            </div>
                                        )}
                                        <div>
                                            <Text fw={600} size="sm">
                                                {course.title}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {course.slug}
                                            </Text>
                                        </div>
                                    </Group>
                                </Table.Td>
                                <Table.Td>{course.category?.name ?? '—'}</Table.Td>
                                <Table.Td>{formatPrice(course.price)}</Table.Td>
                                <Table.Td>
                                    <AdminListSwitch
                                        url={`/admin/courses/${course.id}/toggle`}
                                        field="is_published"
                                        checked={course.is_published}
                                        label="Xuất bản khóa học"
                                        onLabel="Đang bán"
                                        offLabel="Nháp"
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <AdminListSwitch
                                        url={`/admin/courses/${course.id}/toggle`}
                                        field="is_featured"
                                        checked={course.is_featured}
                                        label="Khóa nổi bật"
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs" wrap="nowrap">
                                        <Button component={Link} href={`/admin/courses/${course.id}/edit`} size="xs" variant="light">
                                            Sửa
                                        </Button>
                                        <Button component={Link} href={`/admin/courses/${course.id}/curriculum`} size="xs" variant="light">
                                            Chương trình
                                        </Button>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>

            <AdminPagination paginator={courses} />
        </>
    );
}
