<x-mail::message>
# Chúc mừng bạn đã hoàn thành khóa học!

Xin chào **{{ $student->name }}**,

Bạn đã hoàn thành khóa học **{{ $student->course }}**.

**Mã tra cứu chứng chỉ của bạn:** `{{ $student->student_code }}`

Dùng mã này để tra cứu thông tin và xác minh chứng chỉ trên website.

<x-mail::button :url="$lookupUrl">
Tra cứu chứng chỉ
</x-mail::button>

Trân trọng,<br>
{{ $branding['siteName'] }}
</x-mail::message>
