import { Head, Link, router } from '@inertiajs/react';
import {
    Badge,
    Button,
    Group,
    Modal,
    NumberInput,
    Select,
    Stack,
    Switch,
    Table,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import StarRatingDisplay, { StarRatingInput } from '@/components/public/star-rating';
import type { CourseReviewItem } from '@/types';

type Props = {
    reviews: CourseReviewItem[];
    courses: { id: string; title: string }[];
};

export default function AdminReviewsIndex({ reviews, courses }: Props) {
    const [createOpen, setCreateOpen] = useState(false);

    const createForm = useForm({
        initialValues: {
            course_id: '',
            reviewer_name: '',
            rating: 5,
            body: '',
            is_published: true,
        },
        validate: {
            course_id: (value) => (value ? null : 'Chọn khóa học'),
            reviewer_name: (value) => (value.trim() ? null : 'Nhập tên hiển thị'),
        },
    });

    const togglePublished = (review: CourseReviewItem) => {
        router.patch(`/admin/reviews/${review.id}`, {
            is_published: !review.is_published,
        });
    };

    const displayName = (review: CourseReviewItem) =>
        review.user?.name ?? review.reviewer_name ?? 'Học viên';

    return (
        <>
            <Head title="Đánh giá khóa học" />
            <Stack gap="lg">
                <Group justify="space-between" align="flex-start">
                    <div>
                        <Title order={2}>Đánh giá khóa học</Title>
                        <Text c="dimmed" mt="xs">
                            Kiểm duyệt, ẩn/hiện hoặc tạo đánh giá marketing.
                        </Text>
                    </div>
                    <Button leftSection={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
                        Thêm đánh giá
                    </Button>
                </Group>

                <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Khóa học</Table.Th>
                            <Table.Th>Người đánh giá</Table.Th>
                            <Table.Th>Sao</Table.Th>
                            <Table.Th>Nội dung</Table.Th>
                            <Table.Th>Trạng thái</Table.Th>
                            <Table.Th />
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {reviews.map((review) => (
                            <Table.Tr key={review.id}>
                                <Table.Td>
                                    {review.course ? (
                                        <Link href={`/courses/${review.course.slug}`}>
                                            {review.course.title}
                                        </Link>
                                    ) : (
                                        '—'
                                    )}
                                </Table.Td>
                                <Table.Td>
                                    <Group gap={6}>
                                        <Text size="sm">{displayName(review)}</Text>
                                        {review.is_admin_created && (
                                            <Badge size="xs" variant="light">
                                                Marketing
                                            </Badge>
                                        )}
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <StarRatingDisplay value={review.rating} size={14} />
                                </Table.Td>
                                <Table.Td maw={320}>
                                    <Text size="sm" lineClamp={2}>
                                        {review.body ?? '—'}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Badge color={review.is_published ? 'teal' : 'gray'} variant="light">
                                        {review.is_published ? 'Hiển thị' : 'Ẩn'}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs" wrap="nowrap">
                                        <Button
                                            size="xs"
                                            variant="light"
                                            onClick={() => togglePublished(review)}
                                        >
                                            {review.is_published ? 'Ẩn' : 'Hiện'}
                                        </Button>
                                        <Button
                                            size="xs"
                                            color="red"
                                            variant="subtle"
                                            leftSection={<Trash2 size={14} />}
                                            onClick={() => {
                                                if (confirm('Xóa đánh giá này?')) {
                                                    router.delete(`/admin/reviews/${review.id}`);
                                                }
                                            }}
                                        >
                                            Xóa
                                        </Button>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>

                {reviews.length === 0 && <Text c="dimmed">Chưa có đánh giá nào.</Text>}
            </Stack>

            <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="Thêm đánh giá marketing">
                <form
                    onSubmit={createForm.onSubmit((values) => {
                        router.post('/admin/reviews', values, {
                            onSuccess: () => {
                                setCreateOpen(false);
                                createForm.reset();
                            },
                        });
                    })}
                >
                    <Stack gap="sm">
                        <Select
                            label="Khóa học"
                            placeholder="Chọn khóa học"
                            searchable
                            data={courses.map((course) => ({ value: course.id, label: course.title }))}
                            {...createForm.getInputProps('course_id')}
                        />
                        <TextInput
                            label="Tên hiển thị"
                            placeholder="VD: Nguyễn Thị Lan"
                            {...createForm.getInputProps('reviewer_name')}
                        />
                        <div>
                            <Text size="sm" fw={500} mb={6}>
                                Số sao
                            </Text>
                            <StarRatingInput
                                value={createForm.values.rating}
                                onChange={(value) => createForm.setFieldValue('rating', value)}
                            />
                        </div>
                        <Textarea
                            label="Nội dung"
                            minRows={3}
                            {...createForm.getInputProps('body')}
                        />
                        <Switch
                            label="Hiển thị công khai"
                            {...createForm.getInputProps('is_published', { type: 'checkbox' })}
                        />
                        <Group justify="flex-end">
                            <Button variant="default" onClick={() => setCreateOpen(false)}>
                                Hủy
                            </Button>
                            <Button type="submit">Tạo đánh giá</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}
