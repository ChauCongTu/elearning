import { Head, Link, router, usePage } from '@inertiajs/react';
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
    TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import AdminPageHeader from '@/components/admin/admin-page-header';
import AdminPagination from '@/components/admin/admin-pagination';
import { useAdminFilterForm } from '@/hooks/use-admin-filter-form';
import { applyAdminFilters, FILTER_ALL } from '@/lib/admin-list';
import { formatDateTime } from '@/lib/format';
import type { AdminUserListItem, Auth, Paginated } from '@/types';

type PageProps = {
    flash?: {
        success?: string;
        error?: string;
        generated_password?: string;
    };
};

type Props = {
    users: Paginated<AdminUserListItem>;
    filters: { search?: string; role?: string };
};

export default function AdminUsersIndex({ users, filters }: Props) {
    const { auth, flash } = usePage<PageProps & { auth: Auth }>().props;
    const actorIsRoot = auth.user?.is_root_account === true;
    const [createOpen, setCreateOpen] = useState(false);

    const form = useAdminFilterForm({
        search: filters.search ?? '',
        role: filters.role ?? FILTER_ALL,
    });

    const createForm = useForm({
        initialValues: {
            name: '',
            email: '',
            phone: '',
            role: 'student',
            can_complete_orders: false,
            must_change_password: true,
        },
        validate: {
            name: (value) => (value.trim() ? null : 'Vui lòng nhập họ tên'),
            email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : 'Email không hợp lệ'),
        },
    });

    return (
        <>
            <Head title="Người dùng" />
            <AdminPageHeader title="Người dùng" actions={
                    <Button leftSection={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
                        Thêm người dùng
                    </Button>
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
                        Gửi mật khẩu này cho người dùng. Họ sẽ phải đổi mật khẩu khi đăng nhập lần đầu.
                    </Text>
                </Alert>
            )}

            <div className="admin-filter-bar">
                <Group align="flex-end" wrap="wrap">
                    <TextInput
                        label="Tìm kiếm"
                        placeholder="Tên, email, SĐT..."
                        leftSection={<Search size={16} />}
                        style={{ flex: 1, minWidth: 220 }}
                        {...form.getInputProps('search')}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                applyAdminFilters('/admin/users', form.values);
                            }
                        }}
                    />
                    <Select
                        label="Vai trò"
                        data={[
                            { value: FILTER_ALL, label: 'Tất cả' },
                            { value: 'student', label: 'Học viên' },
                            { value: 'admin', label: 'Admin' },
                        ]}
                        w={160}
                        value={form.values.role}
                        onChange={(value) => form.setFieldValue('role', value ?? FILTER_ALL)}
                        error={form.errors.role}
                    />
                    <Button onClick={() => applyAdminFilters('/admin/users', form.values)}>Lọc</Button>
                </Group>
            </div>

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Họ tên</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Vai trò</Table.Th>
                        <Table.Th>Đăng nhập gần nhất</Table.Th>
                        <Table.Th />
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {users.data.map((user) => (
                        <Table.Tr key={user.id}>
                            <Table.Td>{user.name}</Table.Td>
                            <Table.Td>{user.email}</Table.Td>
                            <Table.Td>
                                <Badge color={user.role === 'admin' ? 'violet' : 'gray'} variant="light">
                                    {user.role === 'admin' ? 'Admin' : 'Học viên'}
                                </Badge>
                            </Table.Td>
                            <Table.Td>{formatDateTime(user.last_login_at)}</Table.Td>
                            <Table.Td>
                                <Button component={Link} href={`/admin/users/${user.id}`} size="xs" variant="light">
                                    Chi tiết
                                </Button>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            {users.data.length === 0 && (
                <Text c="dimmed" mt="md">
                    Chưa có người dùng nào.
                </Text>
            )}

            <AdminPagination paginator={users} />

            <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="Thêm người dùng" size="md">
                <form
                    onSubmit={createForm.onSubmit((values) => {
                        router.post('/admin/users', values, {
                            onSuccess: () => {
                                setCreateOpen(false);
                                createForm.reset();
                            },
                        });
                    })}
                >
                    <Stack gap="sm">
                        <TextInput label="Họ tên" required {...createForm.getInputProps('name')} />
                        <TextInput label="Email" type="email" required {...createForm.getInputProps('email')} />
                        <TextInput label="Số điện thoại" placeholder="09xxxxxxxx" {...createForm.getInputProps('phone')} />

                        <Text size="sm" c="dimmed">
                            Mật khẩu sẽ được hệ thống sinh tự động và hiển thị sau khi tạo tài khoản.
                        </Text>

                        <Switch
                            label="Bắt buộc đổi mật khẩu lần đăng nhập đầu tiên"
                            {...createForm.getInputProps('must_change_password', { type: 'checkbox' })}
                        />

                        <Select
                            label="Vai trò"
                            data={[
                                { value: 'student', label: 'Học viên' },
                                { value: 'admin', label: 'Quản trị viên' },
                            ]}
                            {...createForm.getInputProps('role')}
                        />
                        {actorIsRoot && createForm.values.role === 'admin' && (
                            <Switch
                                label="Quyền xác nhận thanh toán & cấp học thủ công"
                                {...createForm.getInputProps('can_complete_orders', { type: 'checkbox' })}
                            />
                        )}
                        <Group justify="flex-end" mt="sm">
                            <Button variant="default" onClick={() => setCreateOpen(false)}>
                                Hủy
                            </Button>
                            <Button type="submit">Tạo tài khoản</Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}
