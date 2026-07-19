import { Head, Link, router } from '@inertiajs/react';
import { Alert, Box, Button, Container, Text } from '@mantine/core';
import { Clock, Download, RefreshCw } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { formatCheckoutDate, formatPrice } from '@/lib/format';
import { showSuccessNotification } from '@/lib/inertia-notifications';
import type { CheckoutOrder } from '@/types/checkout';

type Props = {
    order: CheckoutOrder;
    isExpired: boolean;
};

function formatCountdown(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function CopyButton({ value, label = 'Sao chép' }: { value: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers.
            const input = document.createElement('textarea');
            input.value = value;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            type="button"
            className={`checkout-payment__copy${copied ? ' checkout-payment__copy--done' : ''}`}
            onClick={copy}
        >
            {copied ? 'Đã copy' : label}
        </button>
    );
}

function TransferRow({
    label,
    value,
    copyValue,
    highlight = false,
}: {
    label: string;
    value: ReactNode;
    copyValue?: string;
    highlight?: boolean;
}) {
    return (
        <tr>
            <th>{label}</th>
            <td>
                <div className="checkout-payment__value-row">
                    <span className={highlight ? 'checkout-payment__amount' : undefined}>{value}</span>
                    {copyValue ? <CopyButton value={copyValue} /> : null}
                </div>
            </td>
        </tr>
    );
}

export default function CheckoutPayment({ order, isExpired: initialExpired }: Props) {
    const expiresAt = order.expires_at ? new Date(order.expires_at).getTime() : null;
    const [secondsLeft, setSecondsLeft] = useState(() => {
        if (!expiresAt) {
            return 0;
        }

        return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    });
    const [isExpired, setIsExpired] = useState(initialExpired || secondsLeft <= 0);
    const [qrReloadKey, setQrReloadKey] = useState(0);

    const countdownLabel = useMemo(() => formatCountdown(secondsLeft), [secondsLeft]);
    const qrImageSrc = `${order.qr.image_url}${order.qr.image_url.includes('?') ? '&' : '?'}t=${qrReloadKey}`;

    useEffect(() => {
        if (!expiresAt || isExpired) {
            return;
        }

        const timer = window.setInterval(() => {
            const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
            setSecondsLeft(remaining);

            if (remaining <= 0) {
                setIsExpired(true);
            }
        }, 1000);

        return () => window.clearInterval(timer);
    }, [expiresAt, isExpired]);

    useEffect(() => {
        if (isExpired || order.status === 'paid') {
            return;
        }

        const poll = window.setInterval(async () => {
            try {
                const response = await fetch(`/orders/${order.code}/status`, {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });

                if (!response.ok) {
                    return;
                }

                const data = (await response.json()) as {
                    status: string;
                    redirect_url?: string;
                };

                if (data.status === 'paid' && data.redirect_url) {
                    showSuccessNotification('Thanh toán thành công. Khóa học đã được kích hoạt.');
                    router.visit(data.redirect_url);
                }

                if (data.status === 'expired') {
                    setIsExpired(true);
                }
            } catch {
                // Ignore transient network errors during polling.
            }
        }, 5000);

        return () => window.clearInterval(poll);
    }, [isExpired, order.code, order.status]);

    return (
        <>
            <Head title={`Thanh toán ${order.code}`} />

            <Box className="checkout-payment public-page-bg">
                <Container className="checkout-payment__container" size="lg">
                    <div className="checkout-payment__notice">
                        Cảm ơn bạn. Đơn hàng của bạn đã được nhận.
                    </div>

                    <div className="checkout-payment__summary">
                        <div>
                            <span className="checkout-payment__summary-label">Mã đơn hàng</span>
                            <span className="checkout-payment__summary-value">{order.code}</span>
                        </div>
                        <div>
                            <span className="checkout-payment__summary-label">Ngày</span>
                            <span className="checkout-payment__summary-value">
                                {formatCheckoutDate(order.created_at)}
                            </span>
                        </div>
                        <div>
                            <span className="checkout-payment__summary-label">Tổng cộng</span>
                            <span className="checkout-payment__summary-value checkout-payment__amount">
                                {formatPrice(order.amount)}
                            </span>
                        </div>
                        <div>
                            <span className="checkout-payment__summary-label">Phương thức thanh toán</span>
                            <span className="checkout-payment__summary-value">Chuyển khoản ngân hàng</span>
                        </div>
                    </div>

                    {order.course?.title && (
                        <Text size="sm" c="dimmed" mt="md">
                            Khóa học: <strong>{order.course.title}</strong>
                        </Text>
                    )}

                    {!order.qr.is_configured && (
                        <div className="checkout-payment__config-alert">
                            Chưa cấu hình tài khoản ngân hàng SePay (`SEPAY_ACCOUNT_NUMBER`, `SEPAY_BANK_CODE`).
                            Mã QR sẽ không hiển thị cho đến khi cấu hình xong.
                        </div>
                    )}

                    {isExpired ? (
                        <Alert color="orange" title="Đơn hàng đã hết hạn" mt="md">
                            Thời gian thanh toán 15 phút đã kết thúc. Vui lòng tạo đơn mới để tiếp tục mua khóa học.
                        </Alert>
                    ) : (
                        <div className="checkout-payment__timer">
                            <Clock size={16} style={{ display: 'inline', marginRight: 6, verticalAlign: 'text-bottom' }} />
                            Hoàn tất chuyển khoản trong{' '}
                            <strong>{countdownLabel}</strong>
                        </div>
                    )}

                    <div className="checkout-payment__card">
                        <div className="checkout-payment__card-title">
                            Thanh toán qua chuyển khoản ngân hàng
                        </div>

                        <div className="checkout-payment__methods">
                            <div className="checkout-payment__method">
                                <div className="checkout-payment__method-title">
                                    Cách 1: Mở app ngân hàng / Ví và quét mã QR
                                </div>

                                <div className="checkout-payment__qr-wrap">
                                    {!isExpired && order.qr.is_configured ? (
                                        <>
                                            <div className="checkout-payment__qr-frame">
                                                <img
                                                    src={qrImageSrc}
                                                    alt="Mã QR thanh toán VietQR"
                                                    loading="eager"
                                                    decoding="async"
                                                    onError={() => setQrReloadKey((value) => value + 1)}
                                                />
                                            </div>
                                            <a
                                                className="checkout-payment__download"
                                                href={order.qr.download_url}
                                                download
                                            >
                                                <Download size={16} />
                                                Tải ảnh QR
                                            </a>
                                        </>
                                    ) : (
                                        <Text size="sm" c="dimmed" ta="center">
                                            {isExpired
                                                ? 'Đơn đã hết hạn — tạo đơn mới để nhận mã QR.'
                                                : 'Chưa thể tạo mã QR. Kiểm tra cấu hình SePay.'}
                                        </Text>
                                    )}
                                </div>
                            </div>

                            <div className="checkout-payment__method">
                                <div className="checkout-payment__method-title">
                                    Cách 2: Chuyển khoản thủ công theo thông tin
                                </div>

                                <table className="checkout-payment__table">
                                    <tbody>
                                        <TransferRow label="Ngân hàng" value={order.qr.bank_name} />
                                        <TransferRow
                                            label="Thụ hưởng"
                                            value={order.qr.account_name ?? '—'}
                                        />
                                        <TransferRow
                                            label="Số tài khoản"
                                            value={order.qr.account_number ?? '—'}
                                            copyValue={order.qr.account_number ?? undefined}
                                        />
                                        <TransferRow
                                            label="Số tiền"
                                            value={formatPrice(order.amount)}
                                            copyValue={String(order.qr.amount)}
                                            highlight
                                        />
                                        <TransferRow
                                            label="Nội dung CK"
                                            value={order.qr.transfer_content}
                                            copyValue={order.qr.transfer_content}
                                        />
                                    </tbody>
                                </table>

                                <div className="checkout-payment__warning">
                                    <strong>Lưu ý:</strong> Vui lòng giữ nguyên nội dung chuyển khoản{' '}
                                    <strong>{order.qr.transfer_content}</strong> để xác nhận thanh toán tự động.
                                </div>
                            </div>
                        </div>

                        {!isExpired && (
                            <div className="checkout-payment__status">
                                <span className="checkout-payment__spinner" aria-hidden="true" />
                                <span>
                                    Trạng thái: <strong>Chờ thanh toán</strong>
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="checkout-payment__actions">
                        {order.course?.slug && (
                            <Button component={Link} href={`/courses/${order.course.slug}`} variant="default">
                                Quay lại khóa học
                            </Button>
                        )}
                        {isExpired && order.course?.slug && (
                            <Button
                                color="pink"
                                leftSection={<RefreshCw size={16} />}
                                onClick={() => router.post(`/courses/${order.course!.slug}/checkout`)}
                            >
                                Tạo đơn mới
                            </Button>
                        )}
                    </div>
                </Container>
            </Box>
        </>
    );
}
