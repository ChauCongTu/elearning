<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <title>Chứng chỉ — {{ $student->name }}</title>
    <style>
        @page { margin: 24px; size: A4 landscape; }
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #1c1917;
            font-size: 14px;
            line-height: 1.55;
        }
        h1, h2, h3 {
            color: #8b6914;
            text-align: center;
        }
        h1 { font-size: 28px; letter-spacing: 4px; margin-bottom: 8px; }
        h2 { font-size: 20px; }
        p { margin: 8px 0; }
        strong { color: #1c1917; }
        code {
            background: #fffdf6;
            border: 1px solid #c4a574;
            padding: 2px 8px;
            font-size: 16px;
            letter-spacing: 1px;
        }
        .header {
            text-align: center;
            margin-bottom: 24px;
            color: #78716c;
            font-size: 12px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }
        .content { max-width: 90%; margin: 0 auto; }
        hr { border: none; border-top: 1px solid #e7e5e4; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">{{ $placeholders['organization'] ?? config('app.name') }}</div>
    <div class="content">
        {!! $content !!}
    </div>
</body>
</html>
