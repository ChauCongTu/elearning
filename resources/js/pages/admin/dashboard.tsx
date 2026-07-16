import { Head } from '@inertiajs/react';
import { Card, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';

type Props = {
    stats: {
        users: number;
        courses: number;
        enrollments: number;
        orders: number;
    };
};

export default function AdminDashboard({ stats }: Props) {
    const items = [
        { label: 'Người dùng', value: stats.users },
        { label: 'Khóa học', value: stats.courses },
        { label: 'Ghi danh', value: stats.enrollments },
        { label: 'Đơn hàng', value: stats.orders },
    ];

    return (
        <>
            <Head title="Quản trị" />
            <Container size="lg">
                <Stack gap="lg">
                    <div>
                        <Title order={2}>Tổng quan</Title>
                        <Text c="dimmed" mt="xs">
                            Admin panel — Phase 0 placeholder
                        </Text>
                    </div>

                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
                        {items.map((item) => (
                            <Card key={item.label} withBorder padding="lg" radius="md">
                                <Text size="sm" c="dimmed">
                                    {item.label}
                                </Text>
                                <Title order={2} mt="xs">
                                    {item.value}
                                </Title>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Stack>
            </Container>
        </>
    );
}
