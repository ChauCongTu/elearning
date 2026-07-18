import { Head, router } from '@inertiajs/react';
import { Badge, Button, Group, Select, Stack, Table, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import AdminPageHeader from '@/components/admin/admin-page-header';
import { formatDateTime } from '@/lib/format';
import type { AdminUserDetail } from '@/types';

type Props = {
    user: AdminUserDetail;
    courses: { id: string; title: string }[];
};

export default function AdminUserShow({ user, courses }: Props) {
    const roleForm = useForm({ initialValues: { role: user.role } });
    const enrollForm = useForm({
        initialValues: { course_id: '' },
        validate: {
            course_id: (value) => (value ? null : 'Chọn khóa học cần cấp quyền'),
        },
    });

    return (
        <>
            <Head title={user.name} />
            <AdminPageHeader title={user.name} description={user.email} />

            <Stack gap="xl">
                <div className="dashboard-panel">
                    <Title order={4} mb="sm">
                        Vai trò hệ thống
                    </Title>
                    <Group align="flex-end" wrap="wrap">
                        <Select
                            label="Vai trò"
                            description="Admin có toàn quyền quản trị. Không thể tự hạ quyền của chính mình."
                            data={[
                                { value: 'student', label: 'Học viên' },
                                { value: 'admin', label: 'Quản trị viên' },
                            ]}
                            w={{ base: '100%', sm: 280 }}
                            {...roleForm.getInputProps('role')}
                        />
                        <Button onClick={() => router.patch(`/admin/users/${user.id}`, roleForm.values)}>
                            Cập nhật vai trò
                        </Button>
                    </Group>
                </div>

                <div className="dashboard-panel">
                    <Title order={4} mb="sm">
                        Cấp quyền học thủ công
                    </Title>
                    <Text size="sm" c="dimmed" mb="md">
                        Dùng khi khách chuyển khoản tay — cấp quyền học ngay không cần đơn hàng.
                    </Text>
                    <Group align="flex-end" wrap="wrap">
                        <Select
                            label="Khóa học"
                            placeholder="Tìm và chọn khóa học"
                            data={courses.map((c) => ({ value: c.id, label: c.title }))}
                            searchable
                            nothingFoundMessage="Không tìm thấy khóa học"
                            w={{ base: '100%', sm: 420 }}
                            {...enrollForm.getInputProps('course_id')}
                        />
                        <Button
                            onClick={() => {
                                if (enrollForm.validate().hasErrors) {
                                    return;
                                }
                                router.post(`/admin/users/${user.id}/enrollments`, enrollForm.values);
                            }}
                        >
                            Cấp quyền học
                        </Button>
                    </Group>
                </div>

                <div className="dashboard-panel">
                    <Title order={4} mb="sm">
                        Khóa học đã ghi danh
                    </Title>
                    <Table striped highlightOnHover withTableBorder>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Khóa học</Table.Th>
                                <Table.Th>Trạng thái</Table.Th>
                                <Table.Th>Nguồn</Table.Th>
                                <Table.Th>Ngày ghi danh</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {user.enrollments.map((enrollment) => (
                                <Table.Tr key={enrollment.id}>
                                    <Table.Td>{enrollment.course?.title ?? '—'}</Table.Td>
                                    <Table.Td>
                                        <Badge variant="light">{enrollment.status}</Badge>
                                    </Table.Td>
                                    <Table.Td>{enrollment.source}</Table.Td>
                                    <Table.Td>{formatDateTime(enrollment.enrolled_at)}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                    {user.enrollments.length === 0 && (
                        <Text c="dimmed" mt="sm">
                            Chưa có ghi danh nào.
                        </Text>
                    )}
                </div>
            </Stack>
        </>
    );
}
