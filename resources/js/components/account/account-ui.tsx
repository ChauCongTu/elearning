import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const statusConfig = {
    pending: { label: 'Chờ thanh toán', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
    paid: { label: 'Đã thanh toán', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
    expired: { label: 'Hết hạn', className: 'bg-gray-50 text-gray-600 ring-gray-200' },
    cancelled: { label: 'Đã hủy', className: 'bg-red-50 text-red-700 ring-red-200' },
} as const;

type OrderStatus = keyof typeof statusConfig;

export function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status as OrderStatus] ?? {
        label: status,
        className: 'bg-gray-50 text-gray-600 ring-gray-200',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                config.className,
            )}
        >
            {config.label}
        </span>
    );
}

export function EmptyState({
    icon,
    title,
    description,
    action,
}: {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 py-14 text-center">
            <div className="mb-4 text-gray-400">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-2 max-w-md text-sm text-gray-500">{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
