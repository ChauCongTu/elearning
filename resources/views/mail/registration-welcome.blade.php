<x-mail::message>
# Chào mừng bạn, {{ $user->name }}!

Cảm ơn bạn đã đăng ký tài khoản tại **{{ $branding['siteName'] }}**.

Vui lòng xác minh email để bắt đầu mua khóa học, học video và theo dõi tiến độ học tập.

<x-mail::button :url="$loginUrl">
Đăng nhập
</x-mail::button>

Nếu bạn không tạo tài khoản này, hãy bỏ qua email này.

Trân trọng,<br>
{{ $branding['siteName'] }}
</x-mail::message>
