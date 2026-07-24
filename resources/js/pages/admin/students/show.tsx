import { Head, Link, router } from '@inertiajs/react';
import { Badge, Button, Group, Stack, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ArrowLeft, Download, Mail, RotateCcw, ShieldOff } from 'lucide-react';
import AdminPageHeader from '@/components/admin/admin-page-header';
import AdminStudentFormFields from '@/components/admin/admin-student-form-fields';
import { formatDateTime } from '@/lib/format';
import type { AdminStudentDetail, AdminStudentFormOptions } from '@/types';
import { adminStudentFormValuesFromDetail, serializeAdminStudentForm } from '@/types/student';

type Props = {
    student: AdminStudentDetail;
    formOptions: AdminStudentFormOptions;
};

export default function AdminStudentShow({ student, formOptions }: Props) {
    const form = useForm({
        initialValues: adminStudentFormValuesFromDetail(student),
    });

    const sourceLabel =
        formOptions.sources.find((item) => item.value === student.source)?.label ?? student.source ?? null;

    return (
        <>
            <Head title={student.name} />
            <AdminPageHeader
                title={student.name}
                description={`Mã học viên: ${student.student_code}`}
                actions={
                    <Group>
                        <Button
                            variant="default"
                            component={Link}
                            href="/admin/students"
                            leftSection={<ArrowLeft size={16} />}
                        >
                            Quay lại
                        </Button>
                        {student.has_certificate && (
                            <Button
                                variant="default"
                                component="a"
                                href={`/admin/students/${student.id}/certificate`}
                                leftSection={<Download size={16} />}
                            >
                                Tải PDF
                            </Button>
                        )}
                        {student.has_certificate && (
                            <Button
                                variant="default"
                                leftSection={<Mail size={16} />}
                                onClick={() => router.post(`/admin/students/${student.id}/resend-email`)}
                            >
                                Gửi lại email
                            </Button>
                        )}
                        {student.is_revoked ? (
                            <Button
                                color="green"
                                leftSection={<RotateCcw size={16} />}
                                onClick={() => router.post(`/admin/students/${student.id}/restore`)}
                            >
                                Khôi phục
                            </Button>
                        ) : (
                            <Button
                                color="red"
                                variant="light"
                                leftSection={<ShieldOff size={16} />}
                                onClick={() => router.post(`/admin/students/${student.id}/revoke`)}
                            >
                                Thu hồi
                            </Button>
                        )}
                    </Group>
                }
            />

            <Group mb="md" gap="xs">
                {student.is_revoked ? (
                    <Badge color="red">Đã thu hồi</Badge>
                ) : (
                    <Badge color="green">Hiệu lực</Badge>
                )}
                {sourceLabel && <Badge variant="light">{sourceLabel}</Badge>}
                {student.certificate_email_sent_at && (
                    <Text size="xs" c="dimmed">
                        Email đã gửi: {formatDateTime(student.certificate_email_sent_at)}
                    </Text>
                )}
            </Group>

            {(student.user || student.enrollment) && (
                <Stack gap="xs" mb="lg" className="dashboard-panel">
                    <Title order={5}>Liên kết hệ thống</Title>
                    {student.user && (
                        <Text size="sm">
                            Tài khoản:{' '}
                            <Link href={`/admin/users/${student.user.id}`}>
                                {student.user.name} ({student.user.email})
                            </Link>
                        </Text>
                    )}
                    {student.linked_course && (
                        <Text size="sm">Khóa online: {student.linked_course.title}</Text>
                    )}
                    {student.enrollment && (
                        <Text size="sm">
                            Ghi danh: {student.enrollment.course?.title ?? '—'} — {student.enrollment.status}
                        </Text>
                    )}
                </Stack>
            )}

            <form
                className="dashboard-panel"
                onSubmit={(event) => {
                    event.preventDefault();
                    router.put(`/admin/students/${student.id}`, serializeAdminStudentForm(form.values));
                }}
            >
                <Title order={4} mb="md">
                    Thông tin học viên
                </Title>
                <Stack gap="sm" maw={720}>
                    <AdminStudentFormFields
                        form={form}
                        formOptions={formOptions}
                        linkedUser={student.user}
                    />
                    <Group justify="flex-end">
                        <Button type="submit">Cập nhật</Button>
                    </Group>
                </Stack>
            </form>

            <Stack gap="xs" mt="lg">
                <Text size="sm" c="dimmed">
                    Tạo lúc: {formatDateTime(student.created_at)}
                </Text>
                {student.revoked_at && (
                    <Text size="sm" c="red">
                        Thu hồi lúc: {formatDateTime(student.revoked_at)}
                    </Text>
                )}
            </Stack>
        </>
    );
}
