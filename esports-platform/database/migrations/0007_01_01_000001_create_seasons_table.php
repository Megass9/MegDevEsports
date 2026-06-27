<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seasons', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamp('start_date');
            $table->timestamp('end_date')->nullable();
            $table->timestamps();
        });

        Schema::create('rankings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('season_id')->constrained()->cascadeOnDelete();
            $table->integer('points')->default(0);
            $table->integer('wins')->default(0);
            $table->integer('losses')->default(0);
            $table->integer('total_matches')->default(0);
            $table->decimal('win_rate', 5, 2)->default(0);
            $table->integer('rank')->nullable();
            $table->timestamps();

            $table->unique(['team_id', 'season_id']);
            $table->index(['season_id', 'rank']);
            $table->index(['season_id', 'points', 'win_rate']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rankings');
        Schema::dropIfExists('seasons');
    }
};
