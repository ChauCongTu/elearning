<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <title>Chứng chỉ — {{ $student->name }}</title>
    <style>
        @page { margin: 0; size: A4 landscape; }
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 0;
            padding: 28px;
            color: #1c1917;
            background: #faf7f2;
        }
        .frame-outer {
            border: 1px solid #c4a574;
            padding: 6px;
            background: #fff;
        }
        .frame-inner {
            border: 3px double #9a7b4f;
            padding: 44px 52px 40px;
            min-height: 500px;
            text-align: center;
            position: relative;
            background: linear-gradient(180deg, #fffdf8 0%, #fff 40%, #fffdf8 100%);
        }
        .corner {
            position: absolute;
            width: 56px;
            height: 56px;
            border-color: #b8860b;
            border-style: solid;
        }
        .corner-tl { top: 18px; left: 18px; border-width: 2px 0 0 2px; }
        .corner-tr { top: 18px; right: 18px; border-width: 2px 2px 0 0; }
        .corner-bl { bottom: 18px; left: 18px; border-width: 0 0 2px 2px; }
        .corner-br { bottom: 18px; right: 18px; border-width: 0 2px 2px 0; }
        .org-name {
            font-size: 11px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #78716c;
            margin-bottom: 6px;
        }
        .org-title {
            font-size: 13px;
            letter-spacing: 1px;
            color: #57534e;
            margin-bottom: 22px;
        }
        h1 {
            font-size: 34px;
            margin: 0 0 8px;
            color: #8b6914;
            letter-spacing: 6px;
            font-weight: normal;
        }
        .subtitle {
            font-size: 13px;
            color: #78716c;
            margin-bottom: 28px;
            letter-spacing: 1px;
        }
        .lead {
            font-size: 14px;
            color: #44403c;
            margin: 0 0 10px;
        }
        .student-name {
            font-size: 30px;
            font-weight: bold;
            margin: 8px 0 18px;
            color: #1c1917;
            line-height: 1.25;
        }
        .course {
            font-size: 18px;
            margin: 0 auto 24px;
            color: #44403c;
            max-width: 80%;
            line-height: 1.45;
        }
        .meta-row {
            font-size: 13px;
            color: #57534e;
            margin-top: 18px;
        }
        .meta-row span + span { margin-left: 28px; }
        .code-box {
            display: inline-block;
            margin-top: 28px;
            padding: 14px 28px 12px;
            border: 2px solid #b8860b;
            background: #fffdf6;
        }
        .code-label {
            font-size: 10px;
            text-transform: uppercase;
            color: #a8a29e;
            letter-spacing: 1.5px;
            margin-bottom: 6px;
        }
        .code-value {
            font-size: 22px;
            font-weight: bold;
            letter-spacing: 3px;
            color: #8b6914;
        }
        .footer-note {
            position: absolute;
            bottom: 22px;
            left: 0;
            right: 0;
            font-size: 10px;
            color: #a8a29e;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    @php
        $organization = $placeholders['organization'] ?? config('app.name');
        $graduationDate = $placeholders['graduation_date'] ?? ($student->graduation_date?->format('d/m/Y') ?? '');
        $className = $placeholders['class_name'] ?? ($student->class_name ?? '');
    @endphp
    <div class="frame-outer">
        <div class="frame-inner">
            <div class="corner corner-tl"></div>
            <div class="corner corner-tr"></div>
            <div class="corner corner-bl"></div>
            <div class="corner corner-br"></div>

            <div class="org-name">{{ $organization }}</div>
            <div class="org-title">Chứng nhận hoàn thành khóa học</div>

            <h1>CHỨNG CHỈ</h1>
            <div class="subtitle">Certificate of Completion</div>

            <p class="lead">Chứng nhận học viên</p>
            <div class="student-name">{{ $student->name }}</div>
            <p class="lead">đã hoàn thành chương trình đào tạo</p>
            <div class="course">{{ $student->course ?? '—' }}</div>

            <div class="meta-row">
                @if($graduationDate !== '')
                    <span>Ngày cấp: <strong>{{ $graduationDate }}</strong></span>
                @endif
                @if($className !== '')
                    <span>Lớp: <strong>{{ $className }}</strong></span>
                @endif
            </div>

            <div class="code-box">
                <div class="code-label">Mã học viên / tra cứu</div>
                <div class="code-value">{{ $student->student_code }}</div>
            </div>

            <div class="footer-note">Tra cứu tại {{ config('app.url') }}/thong-tin</div>
        </div>
    </div>
</body>
</html>
