import { Head } from '@inertiajs/react';
import { CreditCard } from 'lucide-react';
import { EmptyState } from '@/components/account/account-ui';
import Heading from '@/components/heading';
import { formatDateTime, formatPaymentMethod, formatPrice } from '@/lib/format';
import type { PaymentRecord } from '@/types';

type Props = {
    payments: PaymentRecord[];
};

export default function AccountPayments({ payments }: Props) {
    return (
        <>
            <Head title="Lịch sử thanh toán" />

            <Heading
                title="Lịch sử thanh toán"
                description="Các giao dịch thanh toán khóa học — kích hoạt tự động 24/7."
            />

            {payments.length === 0 ? (
                <EmptyState
                    icon={<CreditCard className="size-12" />}
                    title="Chưa có giao dịch nào"
                    description="Lịch sử thanh toán sẽ được ghi nhận sau khi bạn hoàn tất mua khóa học."
                />
            ) : (
                <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                    Mã đơn
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                    Hình thức
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                    Số tiền
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                    Thời gian
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-mono text-gray-900">
                                        {payment.order?.code ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {formatPaymentMethod(payment.gateway)}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-900">
                                        {formatPrice(payment.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {formatDateTime(payment.received_at)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </>
    );
}

AccountPayments.layout = {
    breadcrumbs: [
        {
            title: 'Lịch sử thanh toán',
            href: '/account/payments',
        },
    ],
};
