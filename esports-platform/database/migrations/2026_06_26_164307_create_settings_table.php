<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('group')->default('general');
            $table->timestamps();
        });

        DB::table('settings')->insert([
            ['key' => 'site_name', 'value' => 'Esports Platform', 'group' => 'general'],
            ['key' => 'site_description', 'value' => 'Valorant Turnuva Platformu', 'group' => 'general'],
            ['key' => 'maintenance_mode', 'value' => 'false', 'group' => 'system'],
            ['key' => 'default_game', 'value' => 'valorant', 'group' => 'games'],
            ['key' => 'available_games', 'value' => json_encode(['valorant']), 'group' => 'games'],
            ['key' => 'max_team_size', 'value' => '7', 'group' => 'general'],
            ['key' => 'min_team_size', 'value' => '5', 'group' => 'general'],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
