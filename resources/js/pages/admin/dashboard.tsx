import { Head, Link } from '@inertiajs/react';
import { Badge, Group, SimpleGrid, Table, Text, Title } from '@mantine/core';
import {
    BookOpen,
    DollarSign,
    GraduationCap,
    ShoppingCart,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import AdminPageHeader from '@/components/admin/admin-page-header';
import OrderStatusBadge from '@/components/admin/order-status-badge';
import { formatPrice } from '@/lib/format';
import type { AdminOverview } from '@/types';

type Props = {
    overview: AdminOverview;
};

function KpiCard({
    label,
    value,
    icon,
    accent,
}: {
    label: string;
    value: string;
    icon: ReactNode;
    accent: string;
}) {
    return (
        <div className="dashboard-kpi-card">
            <div className="dashboard-kpi-card__icon" style={{ background: accent }}>
                {icon}
            </div>
            <div>
                <Text size="sm" c="dimmed">
                    {label}
                </Text>
                <Title order={3} mt={4}>
                    {value}
                </Title>
            </div>
        </div>
    );
}

export default function AdminDashboard({ overview }: Props) {
    const maxRevenue = Math.max(...overview.revenue_trend.map((m) => m.value), 1);
    const maxStatus = Math.max(...overview.orders_by_status.map((s) => s.count), 1);

    return (
        <>
            <Head title="Quản trị" />
            <AdminPageHeader
                title="Tổng quan"
                description="Theo dõi doanh thu, đơn hàng và hoạt động học viên."
            />

            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mb="xl">
                <KpiCard
                    label="Đơn hôm nay"
                    value={String(overview.summary.orders_today)}
                    icon={<ShoppingCart size={22} color="#fff" />}
                    accent="linear-gradient(135deg, #7367f0, #9e95f5)"
                />
                <KpiCard
                    label="Doanh thu tháng"
                    value={formatPrice(overview.summary.revenue_month)}
                    icon={<DollarSign size={22} color="#fff" />}
                    accent="linear-gradient(135deg, #28c76f, #48da89)"
                />
                <KpiCard
                    label="Học viên mới"
                    value={String(overview.summary.new_students_month)}
                    icon={<Users size={22} color="#fff" />}
                    accent="linear-gradient(135deg, #00cfe8, #1ce7ff)"
                />
                <KpiCard
                    label="Khóa đang bán"
                    value={String(overview.summary.active_courses)}
                    icon={<BookOpen size={22} color="#fff" />}
                    accent="linear-gradient(135deg, #ff9f43, #ffb976)"
                />
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md" mb="xl">
                <div className="dashboard-panel">
                    <Group justify="space-between" mb="md">
                        <div>
                            <Title order={4}>Doanh thu 6 tháng</Title>
                            <Text size="sm" c="dimmed">
                                Tổng đơn đã thanh toán
                            </Text>
                        </div>
                        <TrendingUp size={20} className="text-violet-500" />
                    </Group>
                    <div className="dashboard-bar-chart">
                        {overview.revenue_trend.map((month) => (
                            <div key={month.label} className="dashboard-bar-chart__item">
                                <div
                                    className="dashboard-bar-chart__bar"
                                    style={{
                                        height: `${Math.max(8, (month.value / maxRevenue) * 100)}%`,
                                    }}
                                    title={formatPrice(month.value)}
                                />
                                <Text size="xs" c="dimmed" mt={6}>
                                    {month.label}
                                </Text>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="dashboard-panel">
                    <Title order={4} mb="xs">
                        Đơn theo trạng thái
                    </Title>
                    <Text size="sm" c="dimmed" mb="md">
                        Phân bổ {overview.totals.orders} đơn hàng
                    </Text>
                    <div className="dashboard-status-list">
                        {overview.orders_by_status.map((item) => (
                            <div key={item.status} className="dashboard-status-list__row">
                                <Group gap="sm">
                                    <OrderStatusBadge status={item.status} />
                                    <Text size="sm">{item.count}</Text>
                                </Group>
                                <div className="dashboard-status-list__track">
                                    <div
                                        className="dashboard-status-list__fill"
                                        style={{
                                            width: `${(item.count / maxStatus) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <SimpleGrid cols={2} spacing="sm" mt="lg">
                        <div className="dashboard-mini-stat">
                            <Users size={16} />
                            <Text size="sm">{overview.totals.users} người dùng</Text>
                        </div>
                        <div className="dashboard-mini-stat">
                            <GraduationCap size={16} />
                            <Text size="sm">{overview.totals.enrollments} ghi danh</Text>
                        </div>
                    </SimpleGrid>
                </div>
            </SimpleGrid>

            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
                <div className="dashboard-panel">
                    <Group justify="space-between" mb="md">
                        <Title order={4}>Đơn hàng gần đây</Title>
                        <Badge component={Link} href="/admin/orders" variant="light">
                            Xem tất cả
                        </Badge>
                    </Group>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Mã</Table.Th>
                                <Table.Th>Khách</Table.Th>
                                <Table.Th>Trạng thái</Table.Th>
                                <Table.Th>Giá</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {overview.recent_orders.map((order) => (
                                <Table.Tr key={order.id}>
                                    <Table.Td>
                                        <Link href={`/admin/orders/${order.id}`}>{order.code}</Link>
                                    </Table.Td>
                                    <Table.Td>{order.user_name ?? '—'}</Table.Td>
                                    <Table.Td>
                                        <OrderStatusBadge status={order.status} />
                                    </Table.Td>
                                    <Table.Td>{formatPrice(order.amount)}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </div>

                <div className="dashboard-panel">
                    <Title order={4} mb="md">
                        Ghi danh mới
                    </Title>
                    <Table striped highlightOnHover>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Học viên</Table.Th>
                                <Table.Th>Khóa học</Table.Th>
                                <Table.Th>Nguồn</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {overview.recent_enrollments.map((item) => (
                                <Table.Tr key={item.id}>
                                    <Table.Td>{item.user_name ?? '—'}</Table.Td>
                                    <Table.Td maw={180}>
                                        <Text size="sm" lineClamp={1}>
                                            {item.course_title ?? '—'}
                                        </Text>
                                    </Table.Td>
                                    <Table.Td>
                                        <Badge variant="light" size="sm">
                                            {item.source}
                                        </Badge>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </div>
            </SimpleGrid>
        </>
    );
}
