import { router } from '@inertiajs/react';
import { Badge, Button, Collapse, Group, Stack, Table, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ExternalLink, Pencil } from 'lucide-react';
import { useEffect } from 'react';
import AdminStudentFormFields from '@/components/admin/admin-student-form-fields';
import { formatDate } from '@/lib/format';
import type { AdminStudentFormOptions, AdminUserStudentProfile } from '@/types/student';
import { adminStudentFormValuesFromUserStudent, serializeAdminStudentForm } from '@/types/student';

type Props = {
    student: AdminUserStudentProfile;
    userId: string;
    formOptions: AdminStudentFormOptions;
    enrollmentOptions: { value: string; label: string }[];
    sourceLabel: (source: string | null) => string;
    expanded: boolean;
    onToggle: () => void;
};

export default function AdminUserStudentInlineRow({
    student,
    userId,
    formOptions,
    enrollmentOptions,
    sourceLabel,
    expanded,
    onToggle,
}: Props) {
    const form = useForm({
        initialValues: adminStudentFormValuesFromUserStudent(student, userId),
    });

    useEffect(() => {
        form.setValues(adminStudentFormValuesFromUserStudent(student, userId));
    }, [student, userId]);

    return (
        <>
            <Table.Tr>
                <Table.Td>
                    <Text fw={500} size="sm">
                        {student.student_code}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {student.name}
                    </Text>
                </Table.Td>
                <Table.Td>
                    <Text size="sm" lineClamp={1}>
                        {student.course ?? '—'}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {student.class_name ?? '—'}
                    </Text>
                </Table.Td>
                <Table.Td>{student.graduation_date ? formatDate(student.graduation_date) : '—'}</Table.Td>
                <Table.Td>{sourceLabel(student.source)}</Table.Td>
                <Table.Td>
                    {student.is_revoked ? (
                        <Badge color="red">Đã thu hồi</Badge>
                    ) : (
                        <Badge color="green">Hiệu lực</Badge>
                    )}
                </Table.Td>
                <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                        <Button
                            size="xs"
                            variant={expanded ? 'filled' : 'light'}
                            leftSection={<Pencil size={14} />}
                            onClick={onToggle}
                        >
                            {expanded ? 'Đóng' : 'Sửa'}
                        </Button>
                        <Button
                            size="xs"
                            variant="subtle"
                            component="a"
                            href={`/admin/students/${student.id}`}
                            leftSection={<ExternalLink size={14} />}
                        >
                            Chi tiết
                        </Button>
                    </Group>
                </Table.Td>
            </Table.Tr>
            <Table.Tr>
                <Table.Td colSpan={6} p={0} style={{ borderBottom: expanded ? undefined : 'none' }}>
                    <Collapse in={expanded}>
                        <form
                            className="dashboard-panel"
                            style={{ margin: '0.75rem', borderRadius: 'var(--mantine-radius-md)' }}
                            onSubmit={form.onSubmit((values) => {
                                router.put(
                                    `/admin/users/${userId}/students/${student.id}`,
                                    serializeAdminStudentForm(values),
                                    { preserveScroll: true },
                                );
                            })}
                        >
                            <Stack gap="sm">
                                <AdminStudentFormFields
                                    form={form}
                                    formOptions={formOptions}
                                    showUserLink={false}
                                    showAutoCode={false}
                                    enrollmentOptions={enrollmentOptions}
                                />
                                <Group justify="flex-end">
                                    <Button variant="default" onClick={onToggle}>
                                        Hủy
                                    </Button>
                                    <Button type="submit">Lưu thay đổi</Button>
                                </Group>
                            </Stack>
                        </form>
                    </Collapse>
                </Table.Td>
            </Table.Tr>
        </>
    );
}
