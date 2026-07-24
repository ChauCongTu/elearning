<x-mail::message>
# Đơn hàng đã hết hạn

Xin chào **{{ $user->name }}**,

Đơn hàng **{{ $order->code }}** đã hết thời gian thanh toán và không còn hiệu lực.

@if($course)
**Khóa học:** {{ $course->title }}
@endif

Bạn có thể tạo đơn hàng mới để tiếp tục đăng ký khóa học.

<x-mail::button :url="$courseUrl">
Quay lại khóa học
</x-mail::button>

Trân trọng,<br>
{{ $branding['siteName'] }}
</x-mail::message>
