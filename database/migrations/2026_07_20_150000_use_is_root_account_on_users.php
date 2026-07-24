<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const ROOT_USER_ID = '019f6b6d-e671-719d-9171-c58c88a649e4';

    public function up(): void
    {
        if (Schema::hasColumn('users', 'is_root') && ! Schema::hasColumn('users', 'is_root_account')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_root_account')->default(false)->after('can_complete_orders');
            });

            DB::table('users')->update(['is_root_account' => DB::raw('is_root')]);

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_root');
            });
        }

        if (! Schema::hasColumn('users', 'is_root_account')) {
            Schema::table('users', function (Blueprint $table) {
                $table->boolean('is_root_account')->default(false)->after('can_complete_orders');
            });
        }

        DB::table('users')->update(['is_root_account' => false]);

        DB::table('users')
            ->where('id', self::ROOT_USER_ID)
            ->update(['is_root_account' => true]);
    }

    public function down(): void
    {
        if (Schema::hasColumn('users', 'is_root_account')) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('is_root_account');
            });
        }
    }
};
