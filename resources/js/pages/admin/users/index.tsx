import { Head, Link } from '@inertiajs/react';
import { Badge, Button, Group, Select, Table, TextInput } from '@mantine/core';
import { Search } from 'lucide-react';
import AdminPageHeader from '@/components/admin/admin-page-header';
import AdminPagination from '@/components/admin/admin-pagination';
import { useAdminFilterForm } from '@/hooks/use-admin-filter-form';
import { applyAdminFilters, FILTER_ALL } from '@/lib/admin-list';
import { formatDateTime } from '@/lib/format';
import type { AdminUserListItem, Paginated } from '@/types';

type Props = {
    users: Paginated<AdminUserListItem>;
    filters: { search?: string; role?: string };
};

export default function AdminUsersIndex({ users, filters }: Props) {
    const form = useAdminFilterForm({
        search: filters.search ?? '',
        role: filters.role ?? FILTER_ALL,
    });

    return (
        <>
            <Head title="Người dùng" />
            <AdminPageHeader title="Người dùng" description="Quản lý học viên và quyền admin." />

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

            <AdminPagination paginator={users} />
        </>
    );
}
