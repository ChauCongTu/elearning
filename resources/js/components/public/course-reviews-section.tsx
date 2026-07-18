import { Form, usePage } from '@inertiajs/react';
import {
    Alert,
    Avatar,
    Button,
    Group,
    Paper,
    Stack,
    Text,
    Textarea,
    Title,
} from '@mantine/core';
import { Star } from 'lucide-react';
import { useState } from 'react';
import StarRatingDisplay, { StarRatingInput } from '@/components/public/star-rating';
import type { CourseReviewItem, CourseReviewSummary } from '@/types';

type Props = {
    courseSlug: string;
    summary: CourseReviewSummary;
    reviews: CourseReviewItem[];
    userReview: CourseReviewItem | null;
    canReview: boolean;
};

type PageProps = {
    flash?: { review_success?: boolean };
};

export default function CourseReviewsSection({
    courseSlug,
    summary,
    reviews,
    userReview,
    canReview,
}: Props) {
    const { flash } = usePage<PageProps>().props;
    const [rating, setRating] = useState(userReview?.rating ?? 5);
    const [body, setBody] = useState(userReview?.body ?? '');

    return (
        <Paper p="xl" radius="xl" className="public-soft-card" mt="xl">
            <Stack gap="lg">
                <Group justify="space-between" align="flex-start" wrap="wrap">
                    <div>
                        <Group gap="xs" mb="xs">
                            <Star size={18} color="var(--brand-primary)" />
                            <Text className="public-kicker">Đánh giá học viên</Text>
                        </Group>
                        <Title order={3}>Học viên nói gì về khóa học</Title>
                    </div>
                    {summary.count > 0 && summary.average !== null && (
                        <Stack gap={2} align="flex-end">
                            <Text fw={800} size="xl" style={{ color: 'var(--brand-primary-dark)' }}>
                                {summary.average.toFixed(1)}/5
                            </Text>
                            <Text size="sm" c="dimmed">
                                {summary.count} đánh giá
                            </Text>
                        </Stack>
                    )}
                </Group>

                {flash?.review_success && (
                    <Alert color="teal" title="Cảm ơn bạn!">
                        Đánh giá của bạn đã được lưu.
                    </Alert>
                )}

                {canReview && (
                    <Paper p="lg" radius="lg" withBorder>
                        <Form action={`/account/courses/${courseSlug}/reviews`} method="post">
                            {({ processing, errors }) => (
                                <Stack gap="md">
                                    <Text fw={600}>
                                        {userReview ? 'Cập nhật đánh giá của bạn' : 'Viết đánh giá'}
                                    </Text>
                                    <StarRatingInput value={rating} onChange={setRating} />
                                    <input type="hidden" name="rating" value={rating} />
                                    <Textarea
                                        name="body"
                                        label="Nội dung (tuỳ chọn)"
                                        placeholder="Chia sẻ trải nghiệm học tập của bạn..."
                                        minRows={3}
                                        value={body}
                                        onChange={(e) => setBody(e.currentTarget.value)}
                                        error={errors.body}
                                    />
                                    {errors.rating && (
                                        <Text size="sm" c="red">
                                            {errors.rating}
                                        </Text>
                                    )}
                                    <Button
                                        type="submit"
                                        loading={processing}
                                        style={{ background: 'var(--brand-gradient)', border: 'none' }}
                                        w="fit-content"
                                    >
                                        {userReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
                                    </Button>
                                </Stack>
                            )}
                        </Form>
                    </Paper>
                )}

                {reviews.length === 0 ? (
                    <Text c="dimmed">Chưa có đánh giá nào cho khóa học này.</Text>
                ) : (
                    <Stack gap="md">
                        {reviews.map((review) => (
                            <Paper key={review.id} p="md" radius="lg" withBorder>
                                <Group align="flex-start" wrap="nowrap">
                                    <Avatar radius="xl" color="brand">
                                        {review.user?.name?.charAt(0) ?? '?'}
                                    </Avatar>
                                    <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                                        <Group justify="space-between" wrap="wrap" gap="xs">
                                            <Text fw={600}>{review.user?.name ?? 'Học viên'}</Text>
                                            <Text size="xs" c="dimmed">
                                                {new Date(review.created_at).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </Group>
                                        <StarRatingDisplay value={review.rating} />
                                        {review.body && (
                                            <Text size="sm" c="dimmed" lh={1.7}>
                                                {review.body}
                                            </Text>
                                        )}
                                    </Stack>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}
