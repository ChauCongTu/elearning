import { Badge } from '@mantine/core';

const labels: Record<string, string> = {
    pending: 'Chờ thanh toán',
    paid: 'Đã thanh toán',
    expired: 'Hết hạn',
    cancelled: 'Đã hủy',
};

const colors: Record<string, string> = {
    pending: 'yellow',
    paid: 'teal',
    expired: 'gray',
    cancelled: 'red',
};

type Props = {
    status: string;
};

export default function OrderStatusBadge({ status }: Props) {
    return (
        <Badge color={colors[status] ?? 'gray'} variant="light">
            {labels[status] ?? status}
        </Badge>
    );
}
