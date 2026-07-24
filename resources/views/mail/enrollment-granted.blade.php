<x-mail::message>
# Bạn đã được cấp khóa học mới

Xin chào **{{ $user->name }}**,

Bạn vừa được cấp quyền học khóa **{{ $course?->title ?? 'mới' }}**.

Hãy đăng nhập và bắt đầu học ngay hôm nay.

<x-mail::button :url="$learnUrl">
Bắt đầu học
</x-mail::button>

Trân trọng,<br>
{{ $branding['siteName'] }}
</x-mail::message>
