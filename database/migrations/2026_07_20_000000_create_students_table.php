<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedInteger('stt')->nullable();
            $table->string('name');
            $table->string('student_code')->unique();
            $table->string('cmnd', 20)->nullable();
            $table->date('cmnd_issue_date')->nullable();
            $table->string('cmnd_issue_place')->nullable();
            $table->date('birthday')->nullable();
            $table->string('original_place')->nullable();
            $table->string('ethnic')->nullable();
            $table->string('course')->nullable();
            $table->string('class_name')->nullable();
            $table->date('graduation_date')->nullable();
            $table->string('type', 10)->default('X');
            $table->foreignUuid('enrollment_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->foreignUuid('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('course_id')->nullable()->constrained()->nullOnDelete();
            $table->string('source', 20)->default('manual');
            $table->boolean('is_revoked')->default(false);
            $table->timestamp('revoked_at')->nullable();
            $table->foreignUuid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('name', 'idx_students_name');
            $table->index('course', 'idx_students_course');
            $table->index('class_name', 'idx_students_class_name');
            $table->index('graduation_date', 'idx_students_graduation_date');
            $table->index('cmnd', 'idx_students_cmnd');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
