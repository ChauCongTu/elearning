import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Accordion,
    Badge,
    Box,
    Button,
    Container,
    Grid,
    Group,
    List,
    Paper,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from '@mantine/core';
import {
    CheckCircle2,
    ChevronRight,
    Clock,
    GraduationCap,
    ListTree,
    Lock,
    PlayCircle,
    ShoppingCart,
    Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
    courseGradient,
    courseThumbnailUrl,
    formatDuration,
    formatPrice,
} from '@/lib/format';
import CourseReviewsSection from '@/components/public/course-reviews-section';
import type { Auth, CourseDetail, CourseReviewItem, CourseReviewSummary } from '@/types';
import type { CoursePurchaseState } from '@/types/checkout';

type Props = {
    course: CourseDetail;
    reviewSummary: CourseReviewSummary;
    reviews: CourseReviewItem[];
    userReview: CourseReviewItem | null;
    canReview: boolean;
    purchaseState: CoursePurchaseState | null;
};

export default function CourseShow({
    course,
    reviewSummary,
    reviews,
    userReview,
    canReview,
    purchaseState,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const thumbnail = courseThumbnailUrl(course.thumbnail_path, course.slug, course.thumbnail_url);
    const totalLessons = course.chapters.reduce(
        (sum, chapter) => sum + chapter.lessons.length,
        0,
    );

    const tableOfContents = useMemo(
        () =>
            [
                course.description
                    ? { id: 'course-intro', label: 'Giới thiệu khóa học' }
                    : null,
                { id: 'course-curriculum', label: 'Đề cương khóa học' },
                course.benefits && course.benefits.length > 0
                    ? { id: 'course-benefits', label: 'Lợi ích khóa học' }
                    : null,
                course.faq && course.faq.length > 0
                    ? { id: 'course-faq', label: 'Câu hỏi thường gặp' }
                    : null,
            ].filter((item): item is { id: string; label: string } => item !== null),
        [course.benefits, course.description, course.faq],
    );

    const [activeSection, setActiveSection] = useState<string | null>(tableOfContents[0]?.id ?? null);

    useEffect(() => {
        const elements = tableOfContents
            .map((item) => document.getElementById(item.id))
            .filter((element): element is HTMLElement => element !== null);

        if (elements.length === 0) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                if (visible[0]?.target.id) {
                    setActiveSection(visible[0].target.id);
                }
            },
            {
                rootMargin: '-20% 0px -55% 0px',
                threshold: [0, 0.25, 0.5, 1],
            },
        );

        elements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [tableOfContents]);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);

        if (!element) {
            return;
        }

        setActiveSection(sectionId);
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', `#${sectionId}`);
    };

    return (
        <>
            <Head title={course.title} />

            <Box
                py={{ base: 32, md: 48 }}
                style={{
                    background: thumbnail
                        ? `linear-gradient(180deg, rgba(0,0,0,0.55), rgba(0,0,0,0.75)), url(${thumbnail}) center/cover`
                        : courseGradient(course.slug),
                }}
            >
                <Container size="xl">
                    <Grid align="center" gap="xl">
                        <Grid.Col span={{ base: 12, md: 8 }}>
                            <Stack gap="md">
                                <Group gap="xs">
                                    {course.is_featured && (
                                        <Badge color="pink" variant="filled">
                                            Nổi bật
                                        </Badge>
                                    )}
                                    {course.category && (
                                        <Badge variant="light" color="gray">
                                            {course.category.name}
                                        </Badge>
                                    )}
                                </Group>
                                <Title
                                    order={1}
                                    c={thumbnail ? 'white' : undefined}
                                    style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}
                                >
                                    {course.title}
                                </Title>
                                {course.excerpt && (
                                    <Text
                                        size="lg"
                                        c={thumbnail ? 'gray.2' : 'dimmed'}
                                        maw={640}
                                    >
                                        {course.excerpt}
                                    </Text>
                                )}
                                <Group gap="lg">
                                    {course.duration_label && (
                                        <Group gap={6} c={thumbnail ? 'gray.1' : 'dimmed'}>
                                            <Clock size={16} />
                                            <Text size="sm">{course.duration_label}</Text>
                                        </Group>
                                    )}
                                    <Group gap={6} c={thumbnail ? 'gray.1' : 'dimmed'}>
                                        <PlayCircle size={16} />
                                        <Text size="sm">{totalLessons} bài học</Text>
                                    </Group>
                                </Group>
                            </Stack>
                        </Grid.Col>
                    </Grid>
                </Container>
            </Box>

            <Container size="xl" py={48}>
                <Grid gap="xl">
                    <Grid.Col span={{ base: 12, md: 8 }}>
                        <Stack gap="xl">
                            {course.description && (
                                <section id="course-intro" className="course-section">
                                    <Title order={3} mb="md">
                                        Giới thiệu khóa học
                                    </Title>
                                    <Box c="dimmed" dangerouslySetInnerHTML={{ __html: course.description }} />

                                </section>
                            )}

                            <section id="course-curriculum" className="course-section">
                                <Title order={3} mb="md">
                                    Đề cương khóa học
                                </Title>
                                <Accordion variant="separated" radius="md">
                                    {course.chapters.map((chapter, index) => (
                                        <Accordion.Item
                                            key={chapter.id}
                                            value={String(chapter.id)}
                                        >
                                            <Accordion.Control>
                                                <Group justify="space-between" pr="md">
                                                    <Text fw={500}>
                                                        {index + 1}. {chapter.title}
                                                    </Text>
                                                    <Badge variant="light" color="gray">
                                                        {chapter.lessons.length} bài
                                                    </Badge>
                                                </Group>
                                            </Accordion.Control>
                                            <Accordion.Panel>
                                                <Stack gap="sm">
                                                    {chapter.lessons.map((lesson) => (
                                                        <Group
                                                            key={lesson.id}
                                                            justify="space-between"
                                                            wrap="nowrap"
                                                        >
                                                            <Group gap="sm" wrap="nowrap">
                                                                <ThemeIcon
                                                                    size={28}
                                                                    radius="xl"
                                                                    variant="light"
                                                                    color={
                                                                        lesson.is_free_preview
                                                                            ? 'teal'
                                                                            : 'gray'
                                                                    }
                                                                >
                                                                    {lesson.is_free_preview ? (
                                                                        <PlayCircle size={14} />
                                                                    ) : (
                                                                        <Lock size={14} />
                                                                    )}
                                                                </ThemeIcon>
                                                                <Text size="sm">
                                                                    {lesson.title}
                                                                </Text>
                                                                {lesson.is_free_preview && (
                                                                    <Badge
                                                                        size="xs"
                                                                        color="teal"
                                                                        variant="light"
                                                                    >
                                                                        Xem thử
                                                                    </Badge>
                                                                )}
                                                            </Group>
                                                            <Text size="xs" c="dimmed">
                                                                {formatDuration(
                                                                    lesson.duration_seconds,
                                                                )}
                                                            </Text>
                                                        </Group>
                                                    ))}
                                                </Stack>
                                            </Accordion.Panel>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            </section>

                            {course.benefits && course.benefits.length > 0 && (
                                <section id="course-benefits" className="course-section">
                                    <Title order={3} mb="md">
                                        Lợi ích khóa học
                                    </Title>
                                    <List
                                        spacing="sm"
                                        icon={
                                            <ThemeIcon color="pink" size={24} radius="xl">
                                                <CheckCircle2 size={14} />
                                            </ThemeIcon>
                                        }
                                    >
                                        {course.benefits.map((benefit) => (
                                            <List.Item key={benefit}>
                                                <Text>{benefit}</Text>
                                            </List.Item>
                                        ))}
                                    </List>
                                </section>
                            )}

                            {course.faq && course.faq.length > 0 && (
                                <section id="course-faq" className="course-section">
                                    <Title order={3} mb="md">
                                        Câu hỏi thường gặp
                                    </Title>
                                    <Accordion variant="contained" radius="md">
                                        {course.faq.map((item, index) => (
                                            <Accordion.Item
                                                key={item.q}
                                                value={`faq-${index}`}
                                            >
                                                <Accordion.Control>
                                                    {item.q}
                                                </Accordion.Control>
                                                <Accordion.Panel>
                                                    <Text c="dimmed">{item.a}</Text>
                                                </Accordion.Panel>
                                            </Accordion.Item>
                                        ))}
                                    </Accordion>
                                </section>
                            )}
                        </Stack>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, md: 4 }}>
                        <Stack gap="md" className="course-sidebar">
                            <Paper p="lg" radius="lg" shadow="md" withBorder className="course-sidebar__card">
                                <Stack gap="md">
                                    <div>
                                        <Text size="sm" c="dimmed">
                                            Học phí
                                        </Text>
                                        <Text fw={700} size="xl" c="pink.7">
                                            {formatPrice(course.price)}
                                        </Text>
                                        {course.compare_price && (
                                            <Text size="sm" c="dimmed" td="line-through">
                                                {formatPrice(course.compare_price)}
                                            </Text>
                                        )}
                                    </div>

                                    {(course.purchase_count ?? 0) > 0 && (
                                        <Group gap={6}>
                                            <Users size={16} />
                                            <Text size="sm" c="dimmed">
                                                {course.purchase_count} học viên đã mua
                                            </Text>
                                        </Group>
                                    )}

                                    {course.instructor_name && (
                                        <Group gap="sm" className="course-sidebar__instructor">
                                            <ThemeIcon
                                                size={40}
                                                radius="md"
                                                color="pink"
                                                variant="light"
                                            >
                                                <GraduationCap size={20} />
                                            </ThemeIcon>
                                            <div>
                                                <Text fw={600} size="sm">
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

                                    {auth.user ? (
                                        purchaseState?.is_enrolled ? (
                                            <Button
                                                component={Link}
                                                href={`/learn/${course.slug}`}
                                                color="pink"
                                                size="md"
                                                fullWidth
                                                leftSection={<PlayCircle size={18} />}
                                            >
                                                Vào học ngay
                                            </Button>
                                        ) : purchaseState?.pending_order_code ? (
                                            <Button
                                                component={Link}
                                                href={`/orders/${purchaseState.pending_order_code}/payment`}
                                                color="pink"
                                                size="md"
                                                fullWidth
                                                variant="light"
                                                leftSection={<ShoppingCart size={18} />}
                                            >
                                                Tiếp tục thanh toán
                                            </Button>
                                        ) : (
                                            <Button
                                                color="pink"
                                                size="md"
                                                fullWidth
                                                leftSection={<ShoppingCart size={18} />}
                                                onClick={() =>
                                                    router.post(`/courses/${course.slug}/checkout`)
                                                }
                                            >
                                                Mua khóa
                                            </Button>
                                        )
                                    ) : (
                                        <Button
                                            component={Link}
                                            href="/login"
                                            color="pink"
                                            size="md"
                                            fullWidth
                                            leftSection={<ShoppingCart size={18} />}
                                        >
                                            Đăng nhập để mua khóa
                                        </Button>
                                    )}

                                    <Text size="xs" c="dimmed" ta="center">
                                        Thanh toán tự động — kích hoạt khóa học 24/7
                                    </Text>
                                </Stack>
                            </Paper>

                            <Paper radius="lg" shadow="sm" withBorder className="course-sidebar__card course-sidebar-toc">
                                <div className="course-sidebar-toc__header">
                                    <Group gap="sm" wrap="nowrap">
                                        <ThemeIcon size={36} radius="md" color="pink" variant="light">
                                            <ListTree size={18} />
                                        </ThemeIcon>
                                        <div>
                                            <Text fw={700} size="sm">
                                                Mục lục nhanh
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                Chuyển tới nội dung khóa học
                                            </Text>
                                        </div>
                                    </Group>
                                </div>

                                <nav className="course-sidebar-toc__nav" aria-label="Mục lục khóa học">
                                    {tableOfContents.map((item, index) => {
                                        const isActive = activeSection === item.id;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                className={`course-sidebar-toc__item${isActive ? ' course-sidebar-toc__item--active' : ''}`}
                                                onClick={() => scrollToSection(item.id)}
                                            >
                                                <span className="course-sidebar-toc__index">{index + 1}</span>
                                                <span className="course-sidebar-toc__label">{item.label}</span>
                                                <ChevronRight size={16} className="course-sidebar-toc__chevron" />
                                            </button>
                                        );
                                    })}
                                </nav>
                            </Paper>
                        </Stack>
                    </Grid.Col>
                </Grid>

                <CourseReviewsSection
                    courseSlug={course.slug}
                    summary={reviewSummary}
                    reviews={reviews}
                    userReview={userReview}
                    canReview={canReview}
                />
            </Container>
        </>
    );
}
