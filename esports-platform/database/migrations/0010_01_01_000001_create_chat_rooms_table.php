<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_rooms', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('tournament');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('chat_messages', function (Blueprint $table) {
            $table->foreignId('chat_room_id')->nullable()->constrained()->cascadeOnDelete();
            $table->index('chat_room_id');
        });
    }

    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table) {
            $table->dropForeign(['chat_room_id']);
            $table->dropColumn('chat_room_id');
        });
        Schema::dropIfExists('chat_rooms');
    }
};
