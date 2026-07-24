import { Link } from '@inertiajs/react';
import {
    Badge,
    Box,
    Button,
    Card,
    Group,
    Stack,
    Text,
    Title,
} from '@mantine/core';
import { Clock, GraduationCap, PlayCircle, ShoppingBag } from 'lucide-react';
import { courseGradient, courseThumbnailUrl, formatPrice } from '@/lib/format';
import { useSiteConfig } from '@/hooks/use-site-config';
import type { Course } from '@/types';

type Props = {
    course: Course;
};

export default function CourseEnrollmentCard({ course }: Props) {
    const site = useSiteConfig();
    const thumbnail = courseThumbnailUrl(course.thumbnail_path, course.slug);
    const badge = course.meta?.badge ?? (course.is_featured ? 'Nổi bật' : null);

    return (
        <Card
            padding={0}
            radius="xl"
            className="public-soft-card public-card-hover h-full"
            style={{ overflow: 'hidden' }}
        >
            <Box
                h={200}
                style={{
                    background: thumbnail
                        ? `linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.5) 100%), url(${thumbnail}) center/cover`
                        : courseGradient(course.slug),
                    position: 'relative',
                }}
            >
                {badge && (
                    <Badge color="brand" variant="filled" style={{ position: 'absolute', top: 12, left: 12 }}>
                        {badge}
                    </Badge>
                )}
            </Box>

            <Stack gap="sm" p="lg" style={{ flex: 1 }}>
                <Title order={4} lineClamp={2} lh={1.35}>
                    {course.title}
                </Title>
                {course.excerpt && (
                    <Text size="sm" c="dimmed" lineClamp={3} lh={1.65}>
                        {course.excerpt}
                    </Text>
                )}

                <Group gap="md" c="dimmed">
                    {course.duration_label && (
                        <Group gap={4}>
                            <Clock size={14} />
                            <Text size="xs">{course.duration_label}</Text>
                        </Group>
                    )}
                    {course.lesson_count_label && (
                        <Group gap={4}>
                            <PlayCircle size={14} />
                            <Text size="xs">{course.lesson_count_label}</Text>
                        </Group>
                    )}
                </Group>

                {(course.purchase_count ?? 0) > 0 && (
                    <Group gap={4} c="dimmed">
                        <ShoppingBag size={14} />
                        <Text size="xs">{course.purchase_count} học viên đã mua</Text>
                    </Group>
                )}

                {course.instructor_name && (
                    <Group gap={6}>
                        <GraduationCap size={14} />
                        <div>
                            <Text size="sm" fw={500}>
                                {course.instructor_name}
                            </Text>
                            {course.instructor_title && (
                                <Text size="xs" c="dimmed">
                                    {course.instructor_title}
                                </Text>
                            )}
                        </div>
                    </Group>
                )}

                <Group gap="xs" align="baseline" mt="auto">
                    <Text fw={800} style={{ color: 'var(--brand-primary-dark)' }}>
                        {formatPrice(course.price)}
                    </Text>
                    {course.compare_price && (
                        <Text size="sm" c="dimmed" td="line-through">
                            {formatPrice(course.compare_price)}
                        </Text>
                    )}
                </Group>

                <Group grow mt="xs">
                    <Button component="a" href={site.zaloUrl} target="_blank" variant="light" color="brand">
                        Nhận tư vấn
                    </Button>
                    <Button
                        component={Link}
                        href={`/courses/${course.slug}`}
                        style={{ background: 'var(--brand-gradient)', border: 'none' }}
                    >
                        Xem chi tiết
                    </Button>
                </Group>
            </Stack>
        </Card>
    );
}
