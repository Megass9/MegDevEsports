<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class TournamentParticipant extends Pivot
{
    use HasFactory;

    protected $table = 'tournament_participants';

    protected $fillable = [
        'tournament_id',
        'team_id',
        'seed',
        'eliminated_at',
        'rank',
    ];

    protected function casts(): array
    {
        return [
            'seed' => 'integer',
            'eliminated_at' => 'datetime',
            'rank' => 'integer',
        ];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
