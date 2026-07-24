<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->foreignUuid('student_id')->nullable()->after('enrollment_id')->constrained()->nullOnDelete();
            $table->timestamp('certificate_email_sent_at')->nullable()->after('issued_at');
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->renameColumn('pdf_path', 'file_path');
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->dropUnique(['verification_code']);
            $table->dropColumn(['verification_code', 'student_name', 'course_title']);
        });
    }

    public function down(): void
    {
        Schema::table('certificates', function (Blueprint $table) {
            $table->string('verification_code')->nullable();
            $table->string('student_name')->nullable();
            $table->string('course_title')->nullable();
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->renameColumn('file_path', 'pdf_path');
            $table->dropConstrainedForeignId('student_id');
            $table->dropColumn('certificate_email_sent_at');
        });

        Schema::table('certificates', function (Blueprint $table) {
            $table->unique('verification_code');
        });
    }
};
