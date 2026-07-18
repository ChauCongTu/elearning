import { Head, Link, router } from '@inertiajs/react';
import { Badge, Button, Group, Stack, Table, Text, Title } from '@mantine/core';
import StarRatingDisplay from '@/components/public/star-rating';
import type { CourseReviewItem } from '@/types';

type Props = {
    reviews: CourseReviewItem[];
};

export default function AdminReviewsIndex({ reviews }: Props) {
    const togglePublished = (review: CourseReviewItem) => {
        router.patch(`/admin/reviews/${review.id}`, {
            is_published: !review.is_published,
        });
    };

    return (
        <>
            <Head title="Đánh giá khóa học" />
            <Stack gap="lg">
                <div>
                    <Title order={2}>Đánh giá khóa học</Title>
                    <Text c="dimmed" mt="xs">
                        Kiểm duyệt và ẩn/hiện đánh giá trên trang khóa học.
                    </Text>
                </div>

                <Table striped highlightOnHover withTableBorder>
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Khóa học</Table.Th>
                            <Table.Th>Học viên</Table.Th>
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
                                <Table.Td>{review.user?.name ?? '—'}</Table.Td>
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
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>

                {reviews.length === 0 && (
                    <Text c="dimmed">Chưa có đánh giá nào.</Text>
                )}
            </Stack>
        </>
    );
}
