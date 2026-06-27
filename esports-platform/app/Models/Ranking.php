<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ranking extends Model
{
    use HasFactory;

    protected $fillable = [
        'team_id',
        'season_id',
        'points',
        'wins',
        'losses',
        'total_matches',
        'win_rate',
        'rank',
    ];

    protected function casts(): array
    {
        return [
            'points' => 'integer',
            'wins' => 'integer',
            'losses' => 'integer',
            'total_matches' => 'integer',
            'win_rate' => 'float',
            'rank' => 'integer',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class);
    }
}
