<?php

return [
    'email_attach_pdf' => env('CERTIFICATE_EMAIL_ATTACH_PDF', false),

    'organization_name' => env('CERTIFICATE_ORGANIZATION', env('APP_NAME', 'Học Viện Bông Nhài Trắng')),
    'organization_short' => env('CERTIFICATE_ORGANIZATION_SHORT', env('APP_NAME', 'Học Viện Bông Nhài Trắng')),

    'default_view' => 'certificates.default',

    // pdflatex | xelatex | lualatex | tectonic — để trống nếu server không có LaTeX
    'latex_binary' => env('CERTIFICATE_LATEX_BINARY', 'pdflatex'),
];
