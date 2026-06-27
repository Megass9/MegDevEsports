<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->text('user_reply')->nullable()->after('admin_reply');
            $table->timestamp('user_replied_at')->nullable()->after('user_reply');
        });
    }

    public function down(): void
    {
        Schema::table('support_tickets', function (Blueprint $table) {
            $table->dropColumn(['user_reply', 'user_replied_at']);
        });
    }
};
