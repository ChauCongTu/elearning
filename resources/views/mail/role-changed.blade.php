<x-mail::message>
# Quyền tài khoản đã thay đổi

Xin chào **{{ $user->name }}**,

Quyền truy cập tài khoản của bạn đã được cập nhật:

- **Trước:** {{ $previousRoleLabel }}
- **Hiện tại:** {{ $newRoleLabel }}

@if($newRoleLabel === 'Quản trị viên')
Bạn có thể đăng nhập vào khu vực quản trị để vận hành hệ thống.
@else
Bạn có thể tiếp tục học và quản lý khóa học trong tài khoản cá nhân.
@endif

<x-mail::button :url="$loginUrl">
Đăng nhập
</x-mail::button>

Trân trọng,<br>
{{ $branding['siteName'] }}
</x-mail::message>
