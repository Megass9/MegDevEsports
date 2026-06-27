<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('match_results', function (Blueprint $table) {
            $table->integer('ocr_team1_score')->nullable()->after('screenshot');
            $table->integer('ocr_team2_score')->nullable()->after('ocr_team1_score');
            $table->float('ocr_confidence')->nullable()->after('ocr_team2_score');
            $table->string('ocr_status')->default('pending')->after('ocr_confidence');
        });
    }

    public function down(): void
    {
        Schema::table('match_results', function (Blueprint $table) {
            $table->dropColumn(['ocr_team1_score', 'ocr_team2_score', 'ocr_confidence', 'ocr_status']);
        });
    }
};
