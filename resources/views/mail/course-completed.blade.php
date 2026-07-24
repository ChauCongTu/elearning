<x-mail::message>
# Chúc mừng bạn đã hoàn thành khóa học!

Xin chào **{{ $user->name }}**,

Bạn đã hoàn thành khóa học **{{ $course?->title ?? 'của chúng tôi' }}**.

@if($course)
Tiếp tục ôn tập hoặc tải chứng chỉ (nếu có) trong tài khoản của bạn.
@endif

<x-mail::button :url="$certificatesUrl">
Xem chứng chỉ
</x-mail::button>

<x-mail::subcopy>
Hoặc truy cập [khóa học của tôi]({{ $coursesUrl }}).
</x-mail::subcopy>

Trân trọng,<br>
{{ $branding['siteName'] }}
</x-mail::message>
