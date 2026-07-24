import { Head, Link, router, useForm as useInertiaForm, usePage } from '@inertiajs/react';
import {
    Badge,
    Button,
    FileInput,
    Group,
    Modal,
    Select,
    Stack,
    Table,
    Text,
    TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Download, Plus, Search, Upload } from 'lucide-react';
import { useState } from 'react';
import AdminPageHeader from '@/components/admin/admin-page-header';
import AdminPagination from '@/components/admin/admin-pagination';
import AdminStudentFormFields from '@/components/admin/admin-student-form-fields';
import { useAdminFilterForm } from '@/hooks/use-admin-filter-form';
import { applyAdminFilters, FILTER_ALL } from '@/lib/admin-list';
import { formatDate } from '@/lib/format';
import type {
    AdminStudentFilterOptions,
    AdminStudentFormOptions,
    AdminStudentListItem,
    Paginated,
} from '@/types';
import { emptyAdminStudentFormValues, serializeAdminStudentForm } from '@/types/student';

type PageProps = {
    flash?: {
        success?: string;
        error?: string;
    };
};

type Props = {
    students: Paginated<AdminStudentListItem>;
    filters: {
        search?: string;
        course?: string;
        class_name?: string;
        original_place?: string;
        is_revoked?: string;
    };
    filterOptions: AdminStudentFilterOptions;
    formOptions: AdminStudentFormOptions;
};

export default function AdminStudentsIndex({ students, filters, filterOptions, formOptions }: Props) {
    const { flash } = usePage<PageProps>().props;
    const [createOpen, setCreateOpen] = useState(false);
    const [importOpen, setImportOpen] = useState(false);

    const form = useAdminFilterForm({
        search: filters.search ?? '',
        course: filters.course ?? FILTER_ALL,
        class_name: filters.class_name ?? FILTER_ALL,
        original_place: filters.original_place ?? FILTER_ALL,
        is_revoked: filters.is_revoked ?? FILTER_ALL,
    });

    const createForm = useForm({
        initialValues: emptyAdminStudentFormValues(),
    });

    const importForm = useInertiaForm<{ file: File | null }>({ file: null });

    const courseOptions = [
        { value: FILTER_ALL, label: 'Tất cả khóa' },
        ...filterOptions.courses.map((value) => ({ value, label: value })),
    ];

    const classOptions = [
        { value: FILTER_ALL, label: 'Tất cả lớp' },
        ...filterOptions.class_names.map((value) => ({ value, label: value })),
    ];

    const placeOptions = [
        { value: FILTER_ALL, label: 'Tất cả quê quán' },
        ...filterOptions.original_places.map((value) => ({ value, label: value })),
    ];

    const sourceLabel = (source: string | null) =>
        formOptions.sources.find((item) => item.value === source)?.label ?? source ?? '—';

    return (
        <>
            <Head title="Tra cứu học viên" />
            <AdminPageHeader title="Tra cứu học viên" actions={
                    <Group>
                        <Button
                            variant="default"
                            leftSection={<Download size={16} />}
                            component="a"
                            href="/admin/students/sample-csv"
                        >
                            Tải mẫu CSV
                        </Button>
                        <Button variant="default" leftSection={<Upload size={16} />} onClick={() => setImportOpen(true)}>
                            Import CSV
                        </Button>
                        <Button leftSection={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
                            Thêm học viên
                        </Button>
                    </Group>
                }
            />

            {flash?.success && (
                <Text c="green" size="sm" mb="md">
                    {flash.success}
                </Text>
            )}

            <div className="admin-filter-bar">
                <Group align="flex-end" wrap="wrap">
                    <TextInput
                        label="Tìm kiếm"
                        placeholder="Tên, mã HV, CMND..."
                        leftSection={<Search size={16} />}
                        style={{ minWidth: 220, flex: 1 }}
                        {...form.getInputProps('search')}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                applyAdminFilters('/admin/students', form.values);
                            }
                        }}
                    />
                    <Select label="Khóa học" data={courseOptions} w={180} {...form.getInputProps('course')} />
                    <Select label="Lớp" data={classOptions} w={160} {...form.getInputProps('class_name')} />
                    <Select label="Quê quán" data={placeOptions} w={180} {...form.getInputProps('original_place')} />
                    <Select
                        label="Trạng thái"
                        data={[
                            { value: FILTER_ALL, label: 'Tất cả' },
                            { value: '0', label: 'Đang hiệu lực' },
                            { value: '1', label: 'Đã thu hồi' },
                        ]}
                        w={160}
                        {...form.getInputProps('is_revoked')}
                    />
                    <Button onClick={() => applyAdminFilters('/admin/students', form.values)}>Lọc</Button>
                </Group>
            </div>

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Mã HV</Table.Th>
                        <Table.Th>Họ tên</Table.Th>
                        <Table.Th>Tài khoản</Table.Th>
                        <Table.Th>Khóa / Lớp</Table.Th>
                        <Table.Th>Ngày TN</Table.Th>
                        <Table.Th>Nguồn</Table.Th>
                        <Table.Th>Trạng thái</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {students.data.map((student) => (
                        <Table.Tr key={student.id}>
                            <Table.Td>
                                <Link href={`/admin/students/${student.id}`}>{student.student_code}</Link>
                            </Table.Td>
                            <Table.Td>{student.name}</Table.Td>
                            <Table.Td maw={180}>
                                {student.user ? (
                                    <Link href={`/admin/users/${student.user.id}`}>
                                        <Text size="sm" lineClamp={1}>
                                            {student.user.name}
                                        </Text>
                                        <Text size="xs" c="dimmed" lineClamp={1}>
                                            {student.user.email}
                                        </Text>
                                    </Link>
                                ) : (
                                    <Text size="sm" c="dimmed">
                                        —
                                    </Text>
                                )}
                            </Table.Td>
                            <Table.Td maw={220}>
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
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <AdminPagination paginator={students} />

            <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="Thêm học viên" size="lg">
                <form
                    onSubmit={createForm.onSubmit((values) => {
                        router.post('/admin/students', serializeAdminStudentForm(values), {
                            onSuccess: () => {
                                setCreateOpen(false);
                                createForm.setValues(emptyAdminStudentFormValues());
                            },
                        });
                    })}
                >
                    <Stack gap="sm">
                        <AdminStudentFormFields form={createForm} formOptions={formOptions} />
                        <Group justify="flex-end">
                            <Button variant="default" onClick={() => setCreateOpen(false)}>
                                Hủy
                            </Button>
                            <Button type="submit">Lưu</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            <Modal opened={importOpen} onClose={() => setImportOpen(false)} title="Import CSV">
                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (!importForm.data.file) return;
                        importForm.post('/admin/students/import', {
                            forceFormData: true,
                            onSuccess: () => {
                                setImportOpen(false);
                                importForm.reset();
                            },
                        });
                    }}
                >
                    <Stack gap="sm">
                        <FileInput
                            label="File CSV (12 cột legacy)"
                            accept=".csv,text/csv"
                            required
                            value={importForm.data.file}
                            onChange={(file) => importForm.setData('file', file)}
                            error={importForm.errors.file}
                        />
                        <Group justify="flex-end">
                            <Button variant="default" onClick={() => setImportOpen(false)}>
                                Hủy
                            </Button>
                            <Button type="submit" loading={importForm.processing}>
                                Import
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}
