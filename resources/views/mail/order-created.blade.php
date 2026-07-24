<x-mail::message>
# Đơn hàng đã được tạo

Xin chào **{{ $user->name }}**,

Đơn hàng **{{ $order->code }}** của bạn đã được tạo thành công.

@php($course = $order->items->first()?->course)

@if($course)
**Khóa học:** {{ $course->title }}
@endif

**Số tiền:** {{ number_format((float) $order->amount, 0, ',', '.') }} đ

@if($order->expires_at)
**Hết hạn thanh toán:** {{ $order->expires_at->timezone(config('app.timezone'))->format('d/m/Y H:i') }}
@endif

Vui lòng hoàn tất chuyển khoản trước thời hạn để được mở khóa học.

<x-mail::button :url="$paymentUrl">
Thanh toán ngay
</x-mail::button>

Trân trọng,<br>
{{ $branding['siteName'] }}
</x-mail::message>
