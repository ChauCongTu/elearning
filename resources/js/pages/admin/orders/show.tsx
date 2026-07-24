import { Head, router } from '@inertiajs/react';
import { Button, Group, Modal, Stack, Table, Text, Textarea, Title } from '@mantine/core';
import { useState } from 'react';
import AdminPageHeader from '@/components/admin/admin-page-header';
import OrderStatusBadge from '@/components/admin/order-status-badge';
import { formatDateTime, formatPaymentMethod, formatPrice } from '@/lib/format';
import type { AdminOrderDetail } from '@/types';

type Props = {
    order: AdminOrderDetail;
    canCompleteOrder: boolean;
};

export default function AdminOrderShow({ order, canCompleteOrder }: Props) {
    const [completeOpen, setCompleteOpen] = useState(false);
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const canComplete = canCompleteOrder && !['paid', 'cancelled'].includes(order.status);

    const submitComplete = () => {
        setSubmitting(true);
        router.post(
            `/admin/orders/${order.id}/complete`,
            { note },
            {
                onFinish: () => {
                    setSubmitting(false);
                    setCompleteOpen(false);
                    setNote('');
                },
            },
        );
    };

    return (
        <>
            <Head title={`Đơn ${order.code}`} />
            <AdminPageHeader
                title={`Đơn ${order.code}`}
                description={`Tạo lúc ${formatDateTime(order.created_at)}`}
                actions={
                    canComplete ? (
                        <Button color="teal" onClick={() => setCompleteOpen(true)}>
                            Xác nhận thanh toán
                        </Button>
                    ) : undefined
                }
            />

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

                {order.manual_completions.length > 0 && (
                    <div className="dashboard-panel">
                        <Title order={4} mb="md">
                            Log xác nhận thủ công
                        </Title>
                        <Stack gap="sm">
                            {order.manual_completions.map((log) => (
                                <div key={log.id}>
                                    <Text size="sm">
                                        <strong>{log.completed_by?.name ?? 'Admin'}</strong> —{' '}
                                        {formatDateTime(log.created_at)}
                                    </Text>
                                    {log.note && (
                                        <Text size="sm" c="dimmed">
                                            {log.note}
                                        </Text>
                                    )}
                                    {log.ip_address && (
                                        <Text size="xs" c="dimmed">
                                            IP: {log.ip_address}
                                        </Text>
                                    )}
                                </div>
                            ))}
                        </Stack>
                    </div>
                )}
            </Stack>

            <Modal
                opened={completeOpen}
                onClose={() => setCompleteOpen(false)}
                title="Xác nhận thanh toán thủ công"
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        Dùng khi khách chuyển khoản tài khoản khác hoặc thanh toán trực tiếp. Hệ thống
                        sẽ mở khóa học và ghi log người thực hiện.
                    </Text>
                    <Textarea
                        label="Ghi chú (tuỳ chọn)"
                        placeholder="VD: CK Vietcombank cá nhân, nhận tiền mặt tại quầy..."
                        minRows={3}
                        value={note}
                        onChange={(event) => setNote(event.currentTarget.value)}
                    />
                    <Group justify="flex-end">
                        <Button variant="default" onClick={() => setCompleteOpen(false)}>
                            Hủy
                        </Button>
                        <Button color="teal" loading={submitting} onClick={submitComplete}>
                            Xác nhận thanh toán
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
