<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'match_id',
        'team_id',
        'submitted_by',
        'score',
        'screenshot',
        'notes',
        'type',
        'ocr_team1_score',
        'ocr_team2_score',
        'ocr_confidence',
        'ocr_status',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'integer',
            'ocr_team1_score' => 'integer',
            'ocr_team2_score' => 'integer',
            'ocr_confidence' => 'float',
        ];
    }

    public function match(): BelongsTo
    {
        return $this->belongsTo(MatchModel::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function submitter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }
}
