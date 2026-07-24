import { Link, usePage } from '@inertiajs/react';
import {
    Badge,
    Box,
    Button,
    Group,
    Progress,
    RingProgress,
    Text,
    ThemeIcon,
} from '@mantine/core';
import {
    ArrowUpRight,
    BookOpen,
    CheckCircle2,
    Clock,
    Flame,
    Play,
    PlayCircle,
    Sparkles,
} from 'lucide-react';
import { courseGradient, courseThumbnailUrl } from '@/lib/format';
import type { Auth } from '@/types';
import type { EnrollmentCard } from '@/types';

type Props = {
    enrollment: EnrollmentCard;
    featured?: boolean;
};

export default function MyCourseRow({ enrollment, featured = false }: Props) {
    const course = enrollment.course;

    if (!course) {
        return null;
    }

    const progress = Math.min(Number.parseFloat(enrollment.progress_percent), 100);
    const isCompleted = progress >= 100 || enrollment.completed_at !== null;
    const thumbnail = courseThumbnailUrl(course.thumbnail_path, course.slug, course.thumbnail_url);

    if (featured) {
        return (
            <article className="my-course-featured">
                <Link
                    href={`/learn/${course.slug}`}
                    className="my-course-featured__media"
                    style={{
                        backgroundImage: thumbnail
                            ? `linear-gradient(115deg, rgba(17, 24, 39, 0.82) 0%, rgba(17, 24, 39, 0.35) 48%, rgba(17, 24, 39, 0.15) 100%), url(${thumbnail})`
                            : courseGradient(course.slug),
                    }}
                    aria-label={`Tiếp tục học ${course.title}`}
                >
                    <div className="my-course-featured__media-top">
                        <Badge
                            variant="filled"
                            color="pink"
                            leftSection={<Flame size={12} />}
                            radius="sm"
                        >
                            Tiếp tục học
                        </Badge>
                        <RingProgress
                            size={58}
                            thickness={5}
                            roundCaps
                            sections={[{ value: progress, color: 'pink' }]}
                            label={
                                <Text fw={800} size="xs" c="white">
                                    {progress}%
                                </Text>
                            }
                        />
                    </div>
                </Link>

                <div className="my-course-featured__body">
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} lts={1}>
                        Khóa đang học dở
                    </Text>
                    <Text
                        component={Link}
                        href={`/learn/${course.slug}`}
                        className="my-course-featured__title"
                    >
                        {course.title}
                    </Text>
                    {course.excerpt && (
                        <Text size="sm" c="dimmed" lineClamp={2} mt={6}>
                            {course.excerpt}
                        </Text>
                    )}

                    <Group gap="sm" mt="md" wrap="wrap">
                        {course.duration_label && (
                            <span className="my-course-chip">
                                <Clock size={14} />
                                {course.duration_label}
                            </span>
                        )}
                        {course.lesson_count_label && (
                            <span className="my-course-chip">
                                <PlayCircle size={14} />
                                {course.lesson_count_label}
                            </span>
                        )}
                    </Group>

                    <Box mt="lg">
                        <Group justify="space-between" mb={8}>
                            <Text size="sm" fw={600}>
                                Tiến độ của bạn
                            </Text>
                            <Text size="sm" fw={800} c="pink">
                                {progress}%
                            </Text>
                        </Group>
                        <Progress value={progress} size="md" radius="xl" color="pink" />
                    </Box>

                    <Group mt="xl" gap="sm" wrap="wrap">
                        <Button
                            component={Link}
                            href={`/learn/${course.slug}`}
                            color="pink"
                            size="md"
                            radius="xl"
                            leftSection={<Play size={16} fill="currentColor" />}
                        >
                            Tiếp tục ngay
                        </Button>
                        <Button
                            component={Link}
                            href={`/courses/${course.slug}`}
                            variant="light"
                            color="gray"
                            radius="xl"
                            rightSection={<ArrowUpRight size={14} />}
                        >
                            Chi tiết khóa
                        </Button>
                    </Group>
                </div>
            </article>
        );
    }

    return (
        <article className="my-course-row">
            <Link
                href={`/learn/${course.slug}`}
                className="my-course-row__thumb-wrap"
                aria-label={`Tiếp tục học ${course.title}`}
            >
                <div
                    className="my-course-row__thumb"
                    style={{
                        backgroundImage: thumbnail
                            ? `url(${thumbnail})`
                            : courseGradient(course.slug),
                    }}
                />
                <div className="my-course-row__thumb-overlay">
                    <ThemeIcon size={42} radius="xl" color="pink" variant="filled">
                        <Play size={18} fill="currentColor" />
                    </ThemeIcon>
                </div>
                <div className="my-course-row__ring">
                    <RingProgress
                        size={46}
                        thickness={4}
                        roundCaps
                        sections={[{ value: progress, color: isCompleted ? 'teal' : 'pink' }]}
                        label={
                            <Text fw={800} size="10px">
                                {progress}%
                            </Text>
                        }
                    />
                </div>
            </Link>

            <div className="my-course-row__body">
                <Group gap="xs" mb={8} wrap="wrap">
                    {isCompleted ? (
                        <Badge
                            color="teal"
                            variant="light"
                            size="sm"
                            leftSection={<CheckCircle2 size={12} />}
                        >
                            Hoàn thành
                        </Badge>
                    ) : progress > 0 ? (
                        <Badge color="pink" variant="light" size="sm" leftSection={<Flame size={12} />}>
                            Đang học
                        </Badge>
                    ) : (
                        <Badge color="gray" variant="light" size="sm">
                            Chưa bắt đầu
                        </Badge>
                    )}
                </Group>

                <Text
                    component={Link}
                    href={`/learn/${course.slug}`}
                    fw={700}
                    size="lg"
                    lh={1.35}
                    className="my-course-row__title"
                >
                    {course.title}
                </Text>

                {course.excerpt && (
                    <Text size="sm" c="dimmed" lineClamp={2} mt={6}>
                        {course.excerpt}
                    </Text>
                )}

                <Group gap="sm" mt="md" wrap="wrap">
                    {course.duration_label && (
                        <span className="my-course-chip">
                            <Clock size={14} />
                            {course.duration_label}
                        </span>
                    )}
                    {course.lesson_count_label && (
                        <span className="my-course-chip">
                            <PlayCircle size={14} />
                            {course.lesson_count_label}
                        </span>
                    )}
                </Group>
            </div>

            <div className="my-course-row__aside">
                <div className="my-course-row__progress-card">
                    <Text size="xs" c="dimmed" mb={8}>
                        Tiến độ
                    </Text>
                    <Progress
                        value={progress}
                        size="lg"
                        radius="xl"
                        color={isCompleted ? 'teal' : 'pink'}
                    />
                    <Text ta="right" size="xs" fw={800} c={isCompleted ? 'teal' : 'pink'} mt={8}>
                        {progress}%
                    </Text>
                </div>

                <Group gap="xs" wrap="nowrap">
                    <Button
                        component={Link}
                        href={`/learn/${course.slug}`}
                        color="pink"
                        radius="xl"
                        leftSection={<BookOpen size={16} />}
                        className="my-course-row__cta"
                    >
                        {isCompleted ? 'Xem lại' : 'Học tiếp'}
                    </Button>
                    <Button
                        component={Link}
                        href={`/courses/${course.slug}`}
                        variant="default"
                        radius="xl"
                        aria-label="Chi tiết khóa học"
                    >
                        <ArrowUpRight size={16} />
                    </Button>
                </Group>
            </div>
        </article>
    );
}

export function MyCoursesHero({
    enrollments,
    completedCount,
    inProgressCount,
}: {
    enrollments: EnrollmentCard[];
    completedCount: number;
    inProgressCount: number;
}) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const firstName = auth.user?.name?.split(' ').slice(-1)[0] ?? 'bạn';
    const averageProgress =
        enrollments.length > 0
            ? Math.round(
                  enrollments.reduce(
                      (sum, item) => sum + Number.parseFloat(item.progress_percent),
                      0,
                  ) / enrollments.length,
              )
            : 0;

    return (
        <section className="my-courses-hero public-soft-mesh">
            <div className="my-courses-hero__content">
                <div className="my-courses-hero__intro">
                    <span className="public-kicker my-courses-hero__kicker">
                        <Sparkles size={14} />
                        Thư viện học tập
                    </span>
                    <h1 className="my-courses-hero__title">
                        Chào {firstName},{' '}
                        <span className="public-gradient-text">tiếp tục hành trình</span>
                    </h1>
                    <Text c="dimmed" maw={520} mt="sm">
                        {enrollments.length} khóa trong thư viện · {inProgressCount} đang học ·{' '}
                        {completedCount} đã hoàn thành
                    </Text>
                </div>

                <div className="my-courses-hero__ring">
                    <RingProgress
                        size={112}
                        thickness={10}
                        roundCaps
                        sections={[{ value: averageProgress, color: 'pink' }]}
                        label={
                            <div>
                                <Text fw={800} size="xl" ta="center" lh={1}>
                                    {averageProgress}%
                                </Text>
                                <Text size="10px" c="dimmed" ta="center" mt={2}>
                                    TB tiến độ
                                </Text>
                            </div>
                        }
                    />
                </div>
            </div>

            <div className="my-courses-hero__stats">
                <div className="my-courses-stat my-courses-stat--total">
                    <ThemeIcon size={40} radius="md" variant="light" color="grape">
                        <BookOpen size={20} />
                    </ThemeIcon>
                    <div>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Tổng khóa
                        </Text>
                        <Text size="xl" fw={800}>
                            {enrollments.length}
                        </Text>
                    </div>
                </div>
                <div className="my-courses-stat my-courses-stat--active">
                    <ThemeIcon size={40} radius="md" variant="light" color="pink">
                        <Flame size={20} />
                    </ThemeIcon>
                    <div>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Đang học
                        </Text>
                        <Text size="xl" fw={800} c="pink">
                            {inProgressCount}
                        </Text>
                    </div>
                </div>
                <div className="my-courses-stat my-courses-stat--done">
                    <ThemeIcon size={40} radius="md" variant="light" color="teal">
                        <CheckCircle2 size={20} />
                    </ThemeIcon>
                    <div>
                        <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                            Hoàn thành
                        </Text>
                        <Text size="xl" fw={800} c="teal">
                            {completedCount}
                        </Text>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function pickFeaturedEnrollment(
    enrollments: EnrollmentCard[],
): EnrollmentCard | null {
    const inProgress = enrollments.filter((enrollment) => {
        const progress = Number.parseFloat(enrollment.progress_percent);

        return progress > 0 && progress < 100 && enrollment.completed_at === null;
    });

    if (inProgress.length > 0) {
        return [...inProgress].sort(
            (a, b) =>
                Number.parseFloat(b.progress_percent) - Number.parseFloat(a.progress_percent),
        )[0];
    }

    return (
        enrollments.find((enrollment) => {
            const progress = Number.parseFloat(enrollment.progress_percent);

            return progress < 100 && enrollment.completed_at === null;
        }) ?? null
    );
}

export function filterEnrollments(
    enrollments: EnrollmentCard[],
    filter: 'all' | 'active' | 'completed',
): EnrollmentCard[] {
    if (filter === 'all') {
        return enrollments;
    }

    if (filter === 'completed') {
        return enrollments.filter((enrollment) => {
            const progress = Number.parseFloat(enrollment.progress_percent);

            return progress >= 100 || enrollment.completed_at !== null;
        });
    }

    return enrollments.filter((enrollment) => {
        const progress = Number.parseFloat(enrollment.progress_percent);

        return progress < 100 && enrollment.completed_at === null;
    });
}
