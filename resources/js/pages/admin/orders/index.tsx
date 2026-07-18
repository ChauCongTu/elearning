import { Head, Link } from '@inertiajs/react';
import { Button, Group, Select, Table, Text, TextInput } from '@mantine/core';
import { Search } from 'lucide-react';
import AdminPageHeader from '@/components/admin/admin-page-header';
import AdminPagination from '@/components/admin/admin-pagination';
import OrderStatusBadge from '@/components/admin/order-status-badge';
import { useAdminFilterForm } from '@/hooks/use-admin-filter-form';
import { applyAdminFilters, FILTER_ALL } from '@/lib/admin-list';
import { formatDateTime, formatPrice } from '@/lib/format';
import type { AdminOrderListItem, Paginated } from '@/types';

type Props = {
    orders: Paginated<AdminOrderListItem>;
    filters: { search?: string; status?: string; from?: string; to?: string };
};

export default function AdminOrdersIndex({ orders, filters }: Props) {
    const form = useAdminFilterForm({
        search: filters.search ?? '',
        status: filters.status ?? FILTER_ALL,
        from: filters.from ?? '',
        to: filters.to ?? '',
    });

    return (
        <>
            <Head title="Đơn hàng" />
            <AdminPageHeader title="Đơn hàng" description="Theo dõi thanh toán và trạng thái đơn." />

            <div className="admin-filter-bar">
                <Group align="flex-end" wrap="wrap">
                    <TextInput
                        label="Tìm kiếm"
                        placeholder="Mã đơn, tên, email..."
                        leftSection={<Search size={16} />}
                        style={{ minWidth: 220, flex: 1 }}
                        {...form.getInputProps('search')}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                applyAdminFilters('/admin/orders', form.values);
                            }
                        }}
                    />
                    <Select
                        label="Trạng thái"
                        data={[
                            { value: FILTER_ALL, label: 'Tất cả' },
                            { value: 'pending', label: 'Chờ thanh toán' },
                            { value: 'paid', label: 'Đã thanh toán' },
                            { value: 'expired', label: 'Hết hạn' },
                            { value: 'cancelled', label: 'Đã hủy' },
                        ]}
                        w={180}
                        value={form.values.status}
                        onChange={(value) => form.setFieldValue('status', value ?? FILTER_ALL)}
                        error={form.errors.status}
                    />
                    <TextInput label="Từ ngày" type="date" {...form.getInputProps('from')} />
                    <TextInput label="Đến ngày" type="date" {...form.getInputProps('to')} />
                    <Button onClick={() => applyAdminFilters('/admin/orders', form.values)}>Lọc</Button>
                </Group>
            </div>

            <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Mã đơn</Table.Th>
                        <Table.Th>Khách hàng</Table.Th>
                        <Table.Th>Khóa học</Table.Th>
                        <Table.Th>Trạng thái</Table.Th>
                        <Table.Th>Số tiền</Table.Th>
                        <Table.Th>Ngày tạo</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {orders.data.map((order) => (
                        <Table.Tr key={order.id}>
                            <Table.Td>
                                <Link href={`/admin/orders/${order.id}`}>{order.code}</Link>
                            </Table.Td>
                            <Table.Td>
                                <Text size="sm">{order.user?.name ?? '—'}</Text>
                                <Text size="xs" c="dimmed">
                                    {order.user?.email}
                                </Text>
                            </Table.Td>
                            <Table.Td maw={200}>
                                <Text size="sm" lineClamp={2}>
                                    {order.courses.join(', ') || '—'}
                                </Text>
                            </Table.Td>
                            <Table.Td>
                                <OrderStatusBadge status={order.status} />
                            </Table.Td>
                            <Table.Td>{formatPrice(order.amount)}</Table.Td>
                            <Table.Td>{formatDateTime(order.created_at)}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <AdminPagination paginator={orders} />
        </>
    );
}
