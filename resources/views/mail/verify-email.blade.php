<x-mail::message>
# Xác minh địa chỉ email

Xin chào **{{ $userName }}**,

Vui lòng nhấn nút bên dưới để xác minh email và kích hoạt tài khoản tại **{{ $branding['siteName'] }}**.

<x-mail::button :url="$verificationUrl">
Xác minh email
</x-mail::button>

Liên kết này sẽ hết hạn sau {{ $expireMinutes }} phút.

Nếu bạn không tạo tài khoản, hãy bỏ qua email này.

Trân trọng,<br>
{{ $branding['siteName'] }}
</x-mail::message>
