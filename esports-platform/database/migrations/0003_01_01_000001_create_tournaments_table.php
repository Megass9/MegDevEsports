<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tournaments', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('game');
            $table->string('type')->default('single_elimination');
            $table->string('status')->default('pending');
            $table->integer('max_teams');
            $table->decimal('entry_fee', 10, 2)->default(0);
            $table->decimal('prize_pool', 12, 2)->default(0);
            $table->text('prize_description')->nullable();
            $table->timestamp('start_date');
            $table->timestamp('registration_end_date')->nullable();
            $table->json('bracket_json')->nullable();
            $table->foreignId('winner_id')->nullable()->constrained('teams')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancelled_reason')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('tournament_participants', function (Blueprint $table) {
            $table->foreignId('tournament_id')->constrained()->cascadeOnDelete();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->integer('seed')->nullable();
            $table->timestamp('eliminated_at')->nullable();
            $table->integer('rank')->nullable();
            $table->timestamps();
            $table->primary(['tournament_id', 'team_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tournament_participants');
        Schema::dropIfExists('tournaments');
    }
};
