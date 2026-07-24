import { Head } from '@inertiajs/react';
import { History } from 'lucide-react';
import { EmptyState } from '@/components/account/account-ui';
import Heading from '@/components/heading';
import { formatDateTime } from '@/lib/format';
import type { LoginHistoryEntry } from '@/types';

type Props = {
    entries: LoginHistoryEntry[];
};

export default function AccountLoginHistory({ entries }: Props) {
    return (
        <>
            <Head title="Lịch sử đăng nhập" />

            <Heading title="Lịch sử đăng nhập" />

            {entries.length === 0 ? (
                <EmptyState
                    icon={<History className="size-12" />}
                    title="Chưa có lịch sử đăng nhập"
                    description="Chưa có phiên đăng nhập nào được ghi nhận."
                />
            ) : (
                <div className="mt-6 overflow-x-auto rounded-xl border border-gray-100">
                    <table className="min-w-full divide-y divide-gray-100 text-sm">
                        <thead className="bg-gray-50/80">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                    Thời gian
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                    Thiết bị
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                    IP
                                </th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">
                                    Vị trí
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {entries.map((entry) => (
                                <tr key={entry.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 text-gray-900">
                                        {formatDateTime(entry.logged_in_at)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">
                                        {entry.device ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-gray-600">
                                        {entry.ip_address ?? '—'}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500">
                                        {entry.location ?? '—'}
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

AccountLoginHistory.layout = {
    breadcrumbs: [
        {
            title: 'Lịch sử đăng nhập',
            href: '/account/login-history',
        },
    ],
};
