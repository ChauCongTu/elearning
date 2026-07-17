import { Head, Link } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import { EmptyState, StatusBadge } from '@/components/account/account-ui';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { formatDateTime, formatPrice, courseThumbnailUrl, courseGradient } from '@/lib/format';
import type { PurchaseOrder } from '@/types';

type Props = {
    orders: PurchaseOrder[];
};

export default function AccountPurchases({ orders }: Props) {
    return (
        <>
            <Head title="Lịch sử mua khóa học" />

            <Heading
                title="Lịch sử mua khóa học"
                description="Các đơn hàng và khóa học bạn đã đăng ký mua."
            />

            {orders.length === 0 ? (
                <EmptyState
                    icon={<ShoppingBag className="size-12" />}
                    title="Chưa có đơn mua nào"
                    description="Khi bạn mua khóa học, lịch sử đơn hàng sẽ hiển thị tại đây."
                    action={
                        <Button asChild className="bg-pink-600 hover:bg-pink-700">
                            <Link href="/courses">Khám phá khóa học</Link>
                        </Button>
                    }
                />
            ) : (
                <div className="mt-6 space-y-4">
                    {orders.map((order) => (
                        <article
                            key={order.id}
                            className="rounded-xl border border-gray-100 bg-gray-50/40 p-5"
                        >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="font-mono text-sm font-medium text-gray-900">
                                        {order.code}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {formatDateTime(order.created_at)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={order.status} />
                                    <span className="text-base font-semibold text-gray-900">
                                        {formatPrice(order.amount)}
                                    </span>
                                </div>
                            </div>

                            <ul className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                                {order.items.map((item) => {
                                    const course = item.course;
                                    const thumbnail = course
                                        ? courseThumbnailUrl(course.thumbnail_path, course.slug)
                                        : null;

                                    return (
                                        <li
                                            key={item.id}
                                            className="flex items-center gap-3 rounded-lg bg-white p-3"
                                        >
                                            <div
                                                className="size-14 shrink-0 rounded-lg bg-cover bg-center"
                                                style={{
                                                    backgroundImage: thumbnail
                                                        ? `url(${thumbnail})`
                                                        : course
                                                          ? courseGradient(course.slug)
                                                          : undefined,
                                                    backgroundColor: thumbnail ? undefined : '#f3f4f6',
                                                }}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium text-gray-800">
                                                    {course?.title ?? 'Khóa học'}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    {formatPrice(item.price)}
                                                </p>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>

                            {order.paid_at && (
                                <p className="mt-3 text-xs text-gray-500">
                                    Thanh toán lúc {formatDateTime(order.paid_at)}
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </>
    );
}

AccountPurchases.layout = {
    breadcrumbs: [
        {
            title: 'Lịch sử mua khóa học',
            href: '/account/purchases',
        },
    ],
};
