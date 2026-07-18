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
import { ArrowUpRight, Clock, GraduationCap, PlayCircle } from 'lucide-react';
import { courseGradient, courseThumbnailUrl, formatPrice } from '@/lib/format';
import type { Course } from '@/types';

type Props = {
    course: Course;
};

export default function CourseCard({ course }: Props) {
    const thumbnail = courseThumbnailUrl(course.thumbnail_path, course.slug);

    return (
        <Card
            component={Link}
            href={`/courses/${course.slug}`}
            padding={0}
            radius="xl"
            className="public-soft-card public-card-hover"
            style={{ textDecoration: 'none', color: 'inherit', overflow: 'hidden' }}
        >
            <Box
                h={190}
                style={{
                    background: thumbnail
                        ? `linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%), url(${thumbnail}) center/cover no-repeat`
                        : courseGradient(course.slug),
                    position: 'relative',
                }}
            >
                <Group gap="xs" style={{ position: 'absolute', top: 12, left: 12 }}>
                    {course.meta?.badge && (
                        <Badge color="brand" variant="filled" size="sm">
                            {course.meta.badge}
                        </Badge>
                    )}
                    {!course.meta?.badge && course.is_featured && (
                        <Badge color="brand" variant="filled" size="sm">
                            Nổi bật
                        </Badge>
                    )}
                </Group>
            </Box>

            <Stack gap="sm" p="lg">
                {course.category && (
                    <Badge variant="light" color="brand" size="sm" w="fit-content">
                        {course.category.name}
                    </Badge>
                )}

                <Title order={4} lineClamp={2} lh={1.35}>
                    {course.title}
                </Title>

                {course.excerpt && (
                    <Text size="sm" c="dimmed" lineClamp={2}>
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

                {course.instructor_name && (
                    <Group gap={4} c="dimmed">
                        <GraduationCap size={14} />
                        <Text size="xs">{course.instructor_name}</Text>
                    </Group>
                )}

                <Group
                    justify="space-between"
                    align="flex-end"
                    mt="xs"
                    pt="sm"
                    style={{ borderTop: '1px solid color-mix(in srgb, var(--brand-primary) 10%, #e5e7eb)' }}
                >
                    <div>
                        <Text fw={800} size="lg" className="public-gradient-text">
                            {formatPrice(course.price)}
                        </Text>
                        {course.compare_price && (
                            <Text size="sm" c="dimmed" td="line-through">
                                {formatPrice(course.compare_price)}
                            </Text>
                        )}
                    </div>
                    <Button
                        size="xs"
                        variant="light"
                        color="brand"
                        radius="xl"
                        rightSection={<ArrowUpRight size={14} />}
                    >
                        Chi tiết
                    </Button>
                </Group>
            </Stack>
        </Card>
    );
}
