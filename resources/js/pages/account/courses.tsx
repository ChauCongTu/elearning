import { Head, Link } from '@inertiajs/react';
import { Button, Text } from '@mantine/core';
import { GraduationCap, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState } from '@/components/account/account-ui';
import MyCourseRow, {
    MyCoursesHero,
    filterEnrollments,
    pickFeaturedEnrollment,
} from '@/components/account/my-course-row';
import type { EnrollmentCard } from '@/types';

type Props = {
    enrollments: EnrollmentCard[];
};

type FilterKey = 'all' | 'active' | 'completed';

const filters: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'active', label: 'Đang học' },
    { key: 'completed', label: 'Hoàn thành' },
];

function countCompleted(enrollments: EnrollmentCard[]): number {
    return enrollments.filter((enrollment) => {
        const progress = Number.parseFloat(enrollment.progress_percent);

        return progress >= 100 || enrollment.completed_at !== null;
    }).length;
}

export default function AccountCourses({ enrollments }: Props) {
    const [filter, setFilter] = useState<FilterKey>('all');
    const completedCount = countCompleted(enrollments);
    const inProgressCount = enrollments.length - completedCount;
    const featured = useMemo(() => pickFeaturedEnrollment(enrollments), [enrollments]);
    const filtered = useMemo(
        () => filterEnrollments(enrollments, filter),
        [enrollments, filter],
    );
    const listItems = useMemo(() => {
        if (!featured || filter !== 'all') {
            return filtered;
        }

        return filtered.filter((enrollment) => enrollment.id !== featured.id);
    }, [filtered, featured, filter]);

    return (
        <>
            <Head title="Khóa học của tôi" />

            {enrollments.length === 0 ? (
                <div className="my-courses-empty-wrap">
                    <EmptyState
                        icon={<GraduationCap className="size-12" />}
                        title="Chưa có khóa học nào"
                        description="Khám phá các khóa học online và bắt đầu hành trình học tập của bạn."
                        action={
                            <Button
                                component={Link}
                                href="/courses"
                                color="pink"
                                radius="xl"
                                size="md"
                            >
                                Khám phá khóa học
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div className="my-courses-hub">
                    <MyCoursesHero
                        enrollments={enrollments}
                        completedCount={completedCount}
                        inProgressCount={inProgressCount}
                    />

                    {featured && filter === 'all' && (
                        <section className="my-courses-section">
                            <div className="my-courses-section__head">
                                <div>
                                    <Text size="xs" tt="uppercase" fw={800} c="pink" lts={1.2}>
                                        Gợi ý hôm nay
                                    </Text>
                                    <Text fw={700} size="lg" mt={4}>
                                        Bắt đầu từ nơi bạn dừng lại
                                    </Text>
                                </div>
                            </div>
                            <MyCourseRow enrollment={featured} featured />
                        </section>
                    )}

                    <section className="my-courses-section">
                        <div className="my-courses-section__head">
                            <div>
                                <Text fw={700} size="lg">
                                    Thư viện khóa học
                                </Text>
                                <Text size="sm" c="dimmed" mt={4}>
                                    Lọc và tiếp tục học các khóa bạn đã sở hữu
                                </Text>
                            </div>
                            <Button
                                component={Link}
                                href="/courses"
                                variant="light"
                                color="pink"
                                radius="xl"
                                leftSection={<Plus size={16} />}
                            >
                                Thêm khóa mới
                            </Button>
                        </div>

                        <div className="my-courses-tabs" role="tablist" aria-label="Lọc khóa học">
                            {filters.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={filter === item.key}
                                    className={`my-courses-tab${filter === item.key ? ' my-courses-tab--active' : ''}`}
                                    onClick={() => setFilter(item.key)}
                                >
                                    {item.label}
                                    <span className="my-courses-tab__count">
                                        {filterEnrollments(enrollments, item.key).length}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {listItems.length === 0 ? (
                            <div className="my-courses-filter-empty">
                                <Text c="dimmed" size="sm">
                                    Không có khóa học trong mục này.
                                </Text>
                                <Button
                                    variant="subtle"
                                    color="pink"
                                    mt="sm"
                                    onClick={() => setFilter('all')}
                                >
                                    Xem tất cả
                                </Button>
                            </div>
                        ) : (
                            <div className="my-courses__list">
                                {listItems.map((enrollment) => (
                                    <MyCourseRow key={enrollment.id} enrollment={enrollment} />
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            )}
        </>
    );
}

AccountCourses.layout = {
    breadcrumbs: [
        {
            title: 'Khóa học của tôi',
            href: '/account/courses',
        },
    ],
};
