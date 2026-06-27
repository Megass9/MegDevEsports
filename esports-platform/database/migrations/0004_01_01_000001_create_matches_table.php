<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->integer('round');
            $table->integer('match_number');
            $table->foreignId('team1_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->foreignId('team2_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->foreignId('winner_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->string('status')->default('scheduled');
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('played_at')->nullable();
            $table->integer('team1_score')->nullable();
            $table->integer('team2_score')->nullable();
            $table->boolean('confirmed_by_team1')->default(false);
            $table->boolean('confirmed_by_team2')->default(false);
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('disputed_at')->nullable();
            $table->text('dispute_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['tournament_id', 'round']);
            $table->index(['tournament_id', 'status']);
        });

        Schema::create('match_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('match_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignId('submitted_by')->constrained('users')->cascadeOnDelete();
            $table->integer('score');
            $table->string('screenshot')->nullable();
            $table->text('notes')->nullable();
            $table->string('type')->default('result');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('match_results');
        Schema::dropIfExists('matches');
    }
};
