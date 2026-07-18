import { Head, Link } from '@inertiajs/react';
import { BookOpen, GraduationCap } from 'lucide-react';
import { EmptyState } from '@/components/account/account-ui';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { courseGradient, courseThumbnailUrl } from '@/lib/format';
import type { EnrollmentCard } from '@/types';

type Props = {
    enrollments: EnrollmentCard[];
};

export default function AccountCourses({ enrollments }: Props) {
    return (
        <>
            <Head title="Khóa học của tôi" />

            <Heading
                title="Khóa học của tôi"
                description="Các khóa học bạn đã đăng ký và tiến độ học tập."
            />

            {enrollments.length === 0 ? (
                <EmptyState
                    icon={<GraduationCap className="size-12" />}
                    title="Chưa có khóa học nào"
                    description="Khám phá các khóa học online và bắt đầu hành trình học tập của bạn."
                    action={
                        <Button asChild className="bg-pink-600 hover:bg-pink-700">
                            <Link href="/courses">Xem khóa học</Link>
                        </Button>
                    }
                />
            ) : (
                <div className="mt-6 grid gap-5 md:grid-cols-2">
                    {enrollments.map((enrollment) => {
                        const course = enrollment.course;
                        if (!course) {
                            return null;
                        }

                        const thumbnail = courseThumbnailUrl(
                            course.thumbnail_path,
                            course.slug,
                        );
                        const progress = Number.parseFloat(enrollment.progress_percent);

                        return (
                            <article
                                key={enrollment.id}
                                className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div
                                    className="h-36 bg-cover bg-center"
                                    style={{
                                        backgroundImage: thumbnail
                                            ? `url(${thumbnail})`
                                            : courseGradient(course.slug),
                                    }}
                                />
                                <div className="space-y-4 p-5">
                                    <div>
                                        <h3 className="font-semibold leading-snug text-gray-900">
                                            {course.title}
                                        </h3>
                                        {course.excerpt && (
                                            <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                                                {course.excerpt}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Tiến độ học</span>
                                            <span className="font-semibold text-pink-600">
                                                {progress}%
                                            </span>
                                        </div>
                                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-fuchsia-500 transition-all"
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Button variant="outline" asChild>
                                            <Link href={`/learn/${course.slug}`}>
                                                <BookOpen className="mr-2 size-4" />
                                                Tiếp tục học
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" asChild>
                                            <Link href={`/courses/${course.slug}`}>
                                                Chi tiết
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
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
