<?php

use App\Contracts\Student\CertificateTemplateRendererInterface;
use App\Enums\CertificateTemplateType;
use App\Models\Category;
use App\Models\Course;
use App\Models\Student;
use App\Support\CertificatePlaceholders;

it('applies certificate placeholders', function () {
    $result = CertificatePlaceholders::apply('Hello {{name}}, code {{student_code}}', [
        'name' => 'Nguyễn Văn An',
        'student_code' => 'SV001',
    ]);

    expect($result)->toBe('Hello Nguyễn Văn An, code SV001');
});

it('renders markdown course template to pdf bytes', function () {
    $category = Category::create([
        'name' => 'Phun xăm',
        'slug' => 'phun-xam-md-'.uniqid(),
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa Markdown',
        'slug' => 'khoa-markdown-'.uniqid(),
        'price' => 1000000,
        'is_published' => true,
        'published_at' => now(),
        'certificate_template_type' => CertificateTemplateType::Markdown,
        'certificate_template' => "# Chứng chỉ\n\n**{{name}}** — {{course}}\n\nMã: `{{student_code}}`",
    ]);

    $student = Student::factory()->create([
        'name' => 'Trần Thị B',
        'student_code' => 'SVMD001',
        'course' => $course->title,
    ]);

    $pdf = app(CertificateTemplateRendererInterface::class)->render($student, $course);

    expect($pdf)->toStartWith('%PDF');
});

it('falls back to default template when latex is unavailable', function () {
    config(['certificate.latex_binary' => 'pdflatex-not-installed-xyz']);

    $category = Category::create([
        'name' => 'Phun xăm',
        'slug' => 'phun-xam-tex-'.uniqid(),
        'sort_order' => 0,
        'is_active' => true,
    ]);

    $course = Course::create([
        'category_id' => $category->id,
        'title' => 'Khóa LaTeX',
        'slug' => 'khoa-latex-'.uniqid(),
        'price' => 1000000,
        'is_published' => true,
        'published_at' => now(),
        'certificate_template_type' => CertificateTemplateType::Latex,
        'certificate_template' => '\\documentclass{article}\\begin{document}Test\\end{document}',
    ]);

    $student = Student::factory()->create([
        'student_code' => 'SVTEX001',
        'course' => $course->title,
    ]);

    $pdf = app(CertificateTemplateRendererInterface::class)->render($student, $course);

    expect($pdf)->toStartWith('%PDF');
});
