<x-mail::message>
# Thanh toán thành công

Xin chào **{{ $user->name }}**,

Chúng tôi đã nhận thanh toán cho đơn hàng **{{ $order->code }}**.

@if($course)
Khóa học **{{ $course->title }}** đã được mở trong tài khoản của bạn.
@endif

**Số tiền:** {{ number_format((float) $order->amount, 0, ',', '.') }} đ

<x-mail::button :url="$coursesUrl">
Vào học ngay
</x-mail::button>

Trân trọng,<br>
{{ $branding['siteName'] }}
</x-mail::message>
