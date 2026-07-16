import { Head, Link } from '@inertiajs/react';
import {
    Container,
    Paper,
    Stack,
    Table,
    Text,
    Title,
} from '@mantine/core';
import HotlineCta from '@/components/public/sections/hotline-cta';
import PageHero from '@/components/public/page-hero';
import PricingTables from '@/components/public/pricing-tables';
import { formatPrice } from '@/lib/format';
import type { Course, SiteContent } from '@/types';

type Props = {
    siteContent: SiteContent;
    courses: Pick<
        Course,
        'id' | 'title' | 'slug' | 'price' | 'compare_price' | 'excerpt'
    >[];
};

export default function PricingPage({ siteContent, courses }: Props) {
    return (
        <>
            <Head title="Bảng giá" />

            <PageHero
                title="Bảng giá"
                subtitle={siteContent.pricing.intro}
            />

            <Container size="xl" py={48}>
                <Stack gap={48}>
                    <PricingTables pricing={siteContent.pricing} />

                    {courses.length > 0 && (
                        <Stack gap="md">
                            <Title order={3}>Giá khóa học online</Title>
                            <Text c="dimmed">
                                Học trực tuyến, thanh toán VietQR — mở khóa ngay sau
                                chuyển khoản.
                            </Text>
                            <Paper withBorder radius="lg" p="lg">
                                <Table striped highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Khóa học</Table.Th>
                                            <Table.Th ta="right">Học phí</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {courses.map((course) => (
                                            <Table.Tr key={course.id}>
                                                <Table.Td>
                                                    <Link href={`/courses/${course.slug}`}>
                                                        <Text fw={500} c="pink.7">
                                                            {course.title}
                                                        </Text>
                                                    </Link>
                                                    {course.excerpt && (
                                                        <Text size="xs" c="dimmed" lineClamp={1}>
                                                            {course.excerpt}
                                                        </Text>
                                                    )}
                                                </Table.Td>
                                                <Table.Td ta="right">
                                                    <Text fw={600}>
                                                        {formatPrice(course.price)}
                                                    </Text>
                                                    {course.compare_price && (
                                                        <Text size="xs" c="dimmed" td="line-through">
                                                            {formatPrice(course.compare_price)}
                                                        </Text>
                                                    )}
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Paper>
                        </Stack>
                    )}
                </Stack>
            </Container>

            <HotlineCta />
        </>
    );
}
