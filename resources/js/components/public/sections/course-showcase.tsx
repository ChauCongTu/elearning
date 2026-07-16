import { Container, Paper, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import SectionHeading from '@/components/public/section-heading';
import CourseEnrollmentCard from '@/components/public/sections/course-enrollment-card';
import type { Course } from '@/types';

type Props = {
    courses: Course[];
    title?: string;
    description?: string;
};

export default function CourseShowcase({
    courses,
    title = 'Khóa học đang tuyển sinh',
    description = 'Chương trình đào tạo bài bản từ cơ bản đến nâng cao, hướng dẫn bởi chuyên gia hàng đầu.',
}: Props) {
    return (
        <Container size="xl" py={64}>
            <SectionHeading
                eyebrow="Khóa học"
                title={title}
                description={description}
                align="center"
            />
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                {courses.map((course) => (
                    <CourseEnrollmentCard key={course.id} course={course} />
                ))}
            </SimpleGrid>
            {courses.length === 0 && (
                <Text ta="center" c="dimmed" py="xl">
                    Đang cập nhật khóa học mới.
                </Text>
            )}
        </Container>
    );
}
