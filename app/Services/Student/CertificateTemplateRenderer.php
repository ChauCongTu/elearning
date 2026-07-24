<?php

namespace App\Services\Student;

use App\Contracts\Student\CertificateTemplateRendererInterface;
use App\Enums\CertificateTemplateType;
use App\Models\Course;
use App\Models\Student;
use App\Support\CertificatePlaceholders;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;
use League\CommonMark\Environment\Environment;
use League\CommonMark\Extension\CommonMark\CommonMarkCoreExtension;
use League\CommonMark\MarkdownConverter;

class CertificateTemplateRenderer implements CertificateTemplateRendererInterface
{
    public function render(Student $student, ?Course $course = null): string
    {
        $type = $this->resolveType($course);
        $placeholders = CertificatePlaceholders::forStudent($student, $course);

        return match ($type) {
            CertificateTemplateType::Markdown => $this->renderMarkdown($student, $course, $placeholders),
            CertificateTemplateType::Latex => $this->renderLatex($student, $course, $placeholders),
            CertificateTemplateType::Default => $this->renderDefault($student, $placeholders),
        };
    }

    public function availablePlaceholders(): array
    {
        return [
            '{{name}}',
            '{{student_code}}',
            '{{course}}',
            '{{course_title}}',
            '{{class_name}}',
            '{{cmnd}}',
            '{{birthday}}',
            '{{graduation_date}}',
            '{{graduation_date_formatted}}',
            '{{issued_at}}',
            '{{issued_at_formatted}}',
            '{{organization}}',
            '{{organization_short}}',
            '{{year}}',
        ];
    }

    private function resolveType(?Course $course): CertificateTemplateType
    {
        if ($course?->certificate_template_type instanceof CertificateTemplateType) {
            return $course->certificate_template_type;
        }

        if (is_string($course?->certificate_template_type)) {
            return CertificateTemplateType::tryFrom($course->certificate_template_type)
                ?? CertificateTemplateType::Default;
        }

        return CertificateTemplateType::Default;
    }

    /**
     * @param  array<string, string>  $placeholders
     */
    private function renderDefault(Student $student, array $placeholders): string
    {
        return Pdf::loadView(config('certificate.default_view', 'certificates.default'), [
            'student' => $student,
            'placeholders' => $placeholders,
        ])->setPaper('a4', 'landscape')->output();
    }

    /**
     * @param  array<string, string>  $placeholders
     */
    private function renderMarkdown(Student $student, ?Course $course, array $placeholders): string
    {
        $template = $this->templateContent($course, CertificateTemplateType::Markdown);
        $markdown = CertificatePlaceholders::apply($template, $placeholders);
        $htmlBody = $this->markdownToHtml($markdown);

        return Pdf::loadView('certificates.markdown-wrapper', [
            'content' => $htmlBody,
            'student' => $student,
            'placeholders' => $placeholders,
        ])->setPaper('a4', 'landscape')->output();
    }

    /**
     * @param  array<string, string>  $placeholders
     */
    private function renderLatex(Student $student, ?Course $course, array $placeholders): string
    {
        $template = $this->templateContent($course, CertificateTemplateType::Latex);
        $latex = CertificatePlaceholders::apply($template, $placeholders);
        $binary = (string) config('certificate.latex_binary', 'pdflatex');

        if ($binary === '' || $this->binaryUnavailable($binary)) {
            Log::warning('LaTeX binary unavailable, falling back to default certificate template.', [
                'binary' => $binary,
                'student_code' => $student->student_code,
            ]);

            return $this->renderDefault($student, $placeholders);
        }

        $directory = storage_path('app/certificates/latex/'.Str::uuid());
        File::ensureDirectoryExists($directory);

        $texPath = $directory.'/certificate.tex';
        File::put($texPath, $latex);

        $result = Process::timeout(120)->run([
            $binary,
            '-interaction=nonstopmode',
            '-output-directory='.$directory,
            $texPath,
        ]);

        $pdfPath = $directory.'/certificate.pdf';

        if (! $result->successful() || ! File::exists($pdfPath)) {
            Log::warning('LaTeX compilation failed, falling back to default certificate template.', [
                'binary' => $binary,
                'exit_code' => $result->exitCode(),
                'output' => Str::limit($result->errorOutput() ?: $result->output(), 2000),
            ]);

            File::deleteDirectory($directory);

            return $this->renderDefault($student, $placeholders);
        }

        $pdf = File::get($pdfPath);
        File::deleteDirectory($directory);

        return $pdf;
    }

    private function templateContent(?Course $course, CertificateTemplateType $type): string
    {
        $custom = trim((string) ($course?->certificate_template ?? ''));

        if ($custom !== '') {
            return $custom;
        }

        $path = match ($type) {
            CertificateTemplateType::Markdown => resource_path('certificates/templates/default.md'),
            CertificateTemplateType::Latex => resource_path('certificates/templates/default.tex'),
            default => '',
        };

        if ($path !== '' && File::exists($path)) {
            return File::get($path);
        }

        return match ($type) {
            CertificateTemplateType::Markdown => "# CHỨNG CHỈ\n\n**{{name}}** đã hoàn thành khóa học **{{course}}**.\n\nMã tra cứu: `{{student_code}}`",
            CertificateTemplateType::Latex => '\\documentclass[a4paper,landscape]{article}\\begin{document}Certificate for {{name}}\\end{document}',
            default => '',
        };
    }

    private function markdownToHtml(string $markdown): string
    {
        $environment = new Environment([
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
        ]);
        $environment->addExtension(new CommonMarkCoreExtension());

        $converter = new MarkdownConverter($environment);

        return $converter->convert($markdown)->getContent();
    }

    private function binaryUnavailable(string $binary): bool
    {
        if (str_contains($binary, DIRECTORY_SEPARATOR) || str_contains($binary, '/')) {
            return ! is_executable($binary);
        }

        $which = Process::run(PHP_OS_FAMILY === 'Windows'
            ? ['where', $binary]
            : ['which', $binary]);

        return ! $which->successful();
    }
}
