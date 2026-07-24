<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('can_complete_orders')->default(false)->after('role');
        });

        Schema::create('order_manual_completions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('completed_by')->constrained('users')->cascadeOnDelete();
            $table->text('note')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index('order_id');
            $table->index('completed_by');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->unsignedInteger('purchase_count_offset')->default(0)->after('meta');
        });

        Schema::table('course_reviews', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropUnique(['user_id', 'course_id']);
        });

        Schema::table('course_reviews', function (Blueprint $table) {
            $table->uuid('user_id')->nullable()->change();
            $table->string('reviewer_name')->nullable()->after('user_id');
            $table->boolean('is_admin_created')->default(false)->after('is_published');
            $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('course_reviews', function (Blueprint $table) {
            $table->dropColumn(['reviewer_name', 'is_admin_created']);
            $table->uuid('user_id')->nullable(false)->change();
            $table->unique(['user_id', 'course_id']);
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn('purchase_count_offset');
        });

        Schema::dropIfExists('order_manual_completions');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('can_complete_orders');
        });
    }
};
