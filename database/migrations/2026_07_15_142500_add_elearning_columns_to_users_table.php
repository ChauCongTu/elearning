<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 20)->nullable()->after('email');
            $table->string('role', 20)->default('student')->after('password');
            $table->unsignedBigInteger('legacy_wp_id')->nullable()->unique()->after('role');
            $table->string('avatar')->nullable()->after('legacy_wp_id');
            $table->string('gender', 20)->nullable()->after('avatar');
            $table->unsignedTinyInteger('age')->nullable()->after('gender');
            $table->text('preference')->nullable()->after('age');
            $table->timestamp('last_login_at')->nullable()->after('preference');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at');
            $table->foreignUuid('created_by')->nullable()->after('last_login_ip')->constrained('users')->nullOnDelete();
            $table->foreignUuid('updated_by')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropConstrainedForeignId('updated_by');
            $table->dropConstrainedForeignId('created_by');
            $table->dropColumn([
                'phone',
                'role',
                'legacy_wp_id',
                'avatar',
                'gender',
                'age',
                'preference',
                'last_login_at',
                'last_login_ip',
            ]);
        });
    }
};
