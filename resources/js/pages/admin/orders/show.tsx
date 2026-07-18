import { Head } from '@inertiajs/react';
import { Stack, Table, Text, Title } from '@mantine/core';
import AdminPageHeader from '@/components/admin/admin-page-header';
import OrderStatusBadge from '@/components/admin/order-status-badge';
import { formatDateTime, formatPaymentMethod, formatPrice } from '@/lib/format';
import type { AdminOrderDetail } from '@/types';

type Props = {
    order: AdminOrderDetail;
};

export default function AdminOrderShow({ order }: Props) {
    return (
        <>
            <Head title={`Đơn ${order.code}`} />
            <AdminPageHeader title={`Đơn ${order.code}`} description={`Tạo lúc ${formatDateTime(order.created_at)}`} />

            <Stack gap="xl">
                <div className="dashboard-panel">
                    <Title order={4} mb="md">
                        Thông tin đơn
                    </Title>
                    <Stack gap="xs">
                        <Text>
                            <strong>Trạng thái:</strong> <OrderStatusBadge status={order.status} />
                        </Text>
                        <Text>
                            <strong>Số tiền:</strong> {formatPrice(order.amount)}
                        </Text>
                        <Text>
                            <strong>Thanh toán lúc:</strong> {formatDateTime(order.paid_at)}
                        </Text>
                        <Text>
                            <strong>Mã giao dịch:</strong> {order.sepay_transaction_id ?? '—'}
                        </Text>
                        <Text>
                            <strong>Hết hạn QR:</strong> {formatDateTime(order.expires_at)}
                        </Text>
                    </Stack>
                </div>

                {order.user && (
                    <div className="dashboard-panel">
                        <Title order={4} mb="md">
                            Khách hàng
                        </Title>
                        <Text>{order.user.name}</Text>
                        <Text c="dimmed">{order.user.email}</Text>
                        <Text c="dimmed">{order.user.phone ?? '—'}</Text>
                    </div>
                )}

                <div className="dashboard-panel">
                    <Title order={4} mb="md">
                        Khóa học
                    </Title>
                    <Table striped>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Khóa học</Table.Th>
                                <Table.Th>Giá snapshot</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {order.items.map((item) => (
                                <Table.Tr key={item.id}>
                                    <Table.Td>{item.course?.title ?? '—'}</Table.Td>
                                    <Table.Td>{formatPrice(item.price)}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </div>

                {order.payments.length > 0 && (
                    <div className="dashboard-panel">
                        <Title order={4} mb="md">
                            Lịch sử thanh toán
                        </Title>
                        <Table striped>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Cổng</Table.Th>
                                    <Table.Th>Số tiền</Table.Th>
                                    <Table.Th>Thời gian</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {order.payments.map((payment) => (
                                    <Table.Tr key={payment.id}>
                                        <Table.Td>{formatPaymentMethod(payment.gateway)}</Table.Td>
                                        <Table.Td>{formatPrice(payment.amount)}</Table.Td>
                                        <Table.Td>{formatDateTime(payment.received_at)}</Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    </div>
                )}
            </Stack>
        </>
    );
}
