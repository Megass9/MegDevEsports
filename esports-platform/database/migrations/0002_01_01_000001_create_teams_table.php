<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('code', 8)->unique();
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->foreignId('captain_id')->constrained('users')->cascadeOnDelete();
            $table->string('game');
            $table->boolean('is_active')->default(true);
            $table->integer('total_wins')->default(0);
            $table->integer('total_losses')->default(0);
            $table->integer('total_matches')->default(0);
            $table->decimal('win_rate', 5, 2)->default(0);
            $table->integer('points')->default(0);
            $table->timestamps();
        });

        Schema::create('team_members', function (Blueprint $table) {
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->boolean('is_substitute')->default(false);
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();
            $table->primary(['team_id', 'user_id']);
        });

        Schema::create('team_invitations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('invited_by')->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_invitations');
        Schema::dropIfExists('team_members');
        Schema::dropIfExists('teams');
    }
};
