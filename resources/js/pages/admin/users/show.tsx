import { Head, router, usePage } from '@inertiajs/react';
import {
    Alert,
    Badge,
    Button,
    CopyButton,
    Group,
    Modal,
    Select,
    Stack,
    Switch,
    Table,
    Text,
    Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import AdminPageHeader from '@/components/admin/admin-page-header';
import AdminStudentFormFields from '@/components/admin/admin-student-form-fields';
import AdminUserStudentInlineRow from '@/components/admin/admin-user-student-inline-row';
import { formatDateTime } from '@/lib/format';
import type { AdminUserDetail, Auth } from '@/types';
import type { AdminStudentFormOptions } from '@/types/student';
import { emptyAdminStudentFormValues, serializeAdminStudentForm } from '@/types/student';

type PageProps = {
    flash?: {
        success?: string;
        generated_password?: string;
    };
};

type Props = {
    user: AdminUserDetail;
    courses: { id: string; title: string }[];
    formOptions: AdminStudentFormOptions;
};

export default function AdminUserShow({ user, courses, formOptions }: Props) {
    const { auth, flash } = usePage<PageProps & { auth: Auth }>().props;
    const actor = auth.user;
    const canGrantOrderOps = actor?.is_root_account === true;
    const canManualEnroll = actor?.can_complete_orders === true;
    const [createStudentOpen, setCreateStudentOpen] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

    const roleForm = useForm({ initialValues: { role: user.role } });
    const permissionForm = useForm({
        initialValues: { can_complete_orders: user.can_complete_orders ?? false },
    });
    const enrollForm = useForm({
        initialValues: { course_id: '' },
        validate: {
            course_id: (value) => (value ? null : 'Chọn khóa học cần cấp quyền'),
        },
    });

    const studentForm = useForm({
        initialValues: {
            ...emptyAdminStudentFormValues(),
            name: user.name,
            user_id: user.id,
        },
    });

    const enrollmentOptions = useMemo(
        () =>
            user.enrollments.map((enrollment) => ({
                value: enrollment.id,
                label: enrollment.course?.title ?? enrollment.id,
            })),
        [user.enrollments],
    );

    const sourceLabel = (source: string | null) =>
        formOptions.sources.find((item) => item.value === source)?.label ?? source ?? '—';

    return (
        <>
            <Head title={user.name} />
            <AdminPageHeader
                title={user.name}
                description={user.email}
                actions={
                    user.is_root_account ? (
                        <Badge color="grape" variant="light" size="lg">
                            Root
                        </Badge>
                    ) : undefined
                }
            />

            {flash?.generated_password && (
                <Alert color="teal" title="Mật khẩu tạm thời" mb="md">
                    <Group justify="space-between" align="center" wrap="nowrap">
                        <Text ff="monospace" fw={600}>
                            {flash.generated_password}
                        </Text>
                        <CopyButton value={flash.generated_password}>
                            {({ copied, copy }) => (
                                <Button size="xs" variant="light" onClick={copy}>
                                    {copied ? 'Đã copy' : 'Copy'}
                                </Button>
                            )}
                        </CopyButton>
                    </Group>
                    <Text size="sm" mt="xs">
                        Gửi cho người dùng trước khi đăng nhập lần đầu.
                    </Text>
                </Alert>
            )}

            <Stack gap="xl">
                <div className="dashboard-panel">
                    <Title order={4} mb="sm">
                        Vai trò hệ thống
                    </Title>
                    <Group align="flex-end" wrap="wrap">
                        <Select
                            label="Vai trò"
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

                {canGrantOrderOps && user.role === 'admin' && !user.is_root_account && (
                    <div className="dashboard-panel">
                        <Title order={4} mb="sm">
                            Quyền vận hành
                        </Title>
                        <Stack gap="md">
                            <Switch
                                label="Xác nhận thanh toán & cấp học thủ công"
                                {...permissionForm.getInputProps('can_complete_orders', { type: 'checkbox' })}
                            />
                            <Button
                                w="fit-content"
                                onClick={() =>
                                    router.patch(`/admin/users/${user.id}`, {
                                        role: user.role,
                                        can_complete_orders: permissionForm.values.can_complete_orders,
                                    })
                                }
                            >
                                Lưu quyền
                            </Button>
                        </Stack>
                    </div>
                )}

                {canManualEnroll && (
                    <div className="dashboard-panel">
                        <Title order={4} mb="sm">
                            Cấp quyền học
                        </Title>
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
                )}

                <div className="dashboard-panel">
                    <Group justify="space-between" mb="sm">
                        <Title order={4}>Hồ sơ tra cứu học viên</Title>
                        <Button leftSection={<Plus size={16} />} onClick={() => setCreateStudentOpen(true)}>
                            Thêm hồ sơ
                        </Button>
                    </Group>
                    <Table striped highlightOnHover withTableBorder mt="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Mã HV</Table.Th>
                                <Table.Th>Khóa / Lớp</Table.Th>
                                <Table.Th>Ngày TN</Table.Th>
                                <Table.Th>Nguồn</Table.Th>
                                <Table.Th>Trạng thái</Table.Th>
                                <Table.Th w={160} />
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {user.students.map((student) => (
                                <AdminUserStudentInlineRow
                                    key={student.id}
                                    student={student}
                                    userId={user.id}
                                    formOptions={formOptions}
                                    enrollmentOptions={enrollmentOptions}
                                    sourceLabel={sourceLabel}
                                    expanded={editingStudentId === student.id}
                                    onToggle={() =>
                                        setEditingStudentId((current) =>
                                            current === student.id ? null : student.id,
                                        )
                                    }
                                />
                            ))}
                        </Table.Tbody>
                    </Table>
                    {user.students.length === 0 && (
                        <Text c="dimmed" mt="sm">
                            Chưa có hồ sơ tra cứu nào liên kết với tài khoản này.
                        </Text>
                    )}
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

            <Modal
                opened={createStudentOpen}
                onClose={() => setCreateStudentOpen(false)}
                title="Thêm hồ sơ tra cứu"
                size="lg"
            >
                <form
                    onSubmit={studentForm.onSubmit((values) => {
                        router.post(`/admin/users/${user.id}/students`, serializeAdminStudentForm(values), {
                            onSuccess: () => {
                                setCreateStudentOpen(false);
                                studentForm.setValues({
                                    ...emptyAdminStudentFormValues(),
                                    name: user.name,
                                    user_id: user.id,
                                });
                            },
                        });
                    })}
                >
                    <Stack gap="sm">
                        <AdminStudentFormFields
                            form={studentForm}
                            formOptions={formOptions}
                            showUserLink={false}
                            enrollmentOptions={enrollmentOptions}
                        />
                        <Group justify="flex-end">
                            <Button variant="default" onClick={() => setCreateStudentOpen(false)}>
                                Hủy
                            </Button>
                            <Button type="submit">Lưu hồ sơ</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}
