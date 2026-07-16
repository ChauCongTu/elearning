import { Head, router } from '@inertiajs/react';
import {
    Container,
    Group,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { Search } from 'lucide-react';
import { useState } from 'react';
import CourseCard from '@/components/public/course-card';
import type { Category, Course, CourseFilters } from '@/types';

type Props = {
    courses: Course[];
    categories: Category[];
    filters: CourseFilters;
};

const sortOptions = [
    { value: 'latest', label: 'Mới nhất' },
    { value: 'price_asc', label: 'Giá thấp → cao' },
    { value: 'price_desc', label: 'Giá cao → thấp' },
];

export default function CoursesIndex({ courses, categories, filters }: Props) {
    const [search, setSearch] = useState(filters.q);

    const applyFilters = (next: Partial<CourseFilters>) => {
        router.get(
            '/courses',
            { ...filters, ...next },
            { preserveState: true, replace: true },
        );
    };

    const debouncedSearch = useDebouncedCallback((value: string) => {
        applyFilters({ q: value });
    }, 350);

    return (
        <>
            <Head title="Khóa học" />

            <Container size="xl" py={{ base: 32, md: 48 }}>
                <Stack gap="xl">
                    <div>
                        <Title order={1}>Khóa học</Title>
                        <Text c="dimmed" mt="xs" maw={560}>
                            Tìm khóa học phù hợp — lọc theo danh mục, sắp xếp theo
                            giá hoặc mới nhất.
                        </Text>
                    </div>

                    <Group align="flex-end" grow preventGrowOverflow={false} wrap="wrap">
                        <TextInput
                            label="Tìm kiếm"
                            placeholder="Tên khóa học..."
                            leftSection={<Search size={16} />}
                            value={search}
                            onChange={(event) => {
                                const value = event.currentTarget.value;
                                setSearch(value);
                                debouncedSearch(value);
                            }}
                            style={{ flex: '1 1 280px' }}
                        />
                        <Select
                            label="Danh mục"
                            placeholder="Tất cả"
                            clearable
                            data={categories.map((c) => ({
                                value: c.slug,
                                label: c.name,
                            }))}
                            value={filters.category || null}
                            onChange={(value) =>
                                applyFilters({ category: value ?? '' })
                            }
                            style={{ flex: '1 1 200px' }}
                        />
                        <Select
                            label="Sắp xếp"
                            data={sortOptions}
                            value={filters.sort}
                            onChange={(value) =>
                                applyFilters({ sort: value ?? 'latest' })
                            }
                            style={{ flex: '1 1 180px' }}
                        />
                    </Group>

                    <Text size="sm" c="dimmed">
                        {courses.length} khóa học
                    </Text>

                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </SimpleGrid>

                    {courses.length === 0 && (
                        <Stack align="center" py={64} gap="sm">
                            <Text fw={500}>Không tìm thấy khóa học</Text>
                            <Text c="dimmed" size="sm">
                                Thử đổi từ khóa hoặc bộ lọc danh mục.
                            </Text>
                        </Stack>
                    )}
                </Stack>
            </Container>
        </>
    );
}
