<?php

namespace App\Models;

use App\Enums\MatchStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MatchModel extends Model
{
    use HasFactory;

    protected $table = 'matches';

    protected $fillable = [
        'tournament_id',
        'round',
        'match_number',
        'team1_id',
        'team2_id',
        'winner_id',
        'status',
        'scheduled_at',
        'played_at',
        'notes',
        'team1_score',
        'team2_score',
        'confirmed_by_team1',
        'confirmed_by_team2',
        'confirmed_at',
        'disputed_at',
        'dispute_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => MatchStatus::class,
            'scheduled_at' => 'datetime',
            'played_at' => 'datetime',
            'confirmed_at' => 'datetime',
            'disputed_at' => 'datetime',
            'team1_score' => 'integer',
            'team2_score' => 'integer',
            'confirmed_by_team1' => 'boolean',
            'confirmed_by_team2' => 'boolean',
            'round' => 'integer',
            'match_number' => 'integer',
        ];
    }

    public function tournament(): BelongsTo
    {
        return $this->belongsTo(Tournament::class);
    }

    public function team1(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team1_id');
    }

    public function team2(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team2_id');
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'winner_id');
    }

    public function results(): HasMany
    {
        return $this->hasMany(MatchResult::class, 'match_id');
    }

    public function screenshots(): HasMany
    {
        return $this->hasMany(MatchResult::class, 'match_id')->where('type', 'screenshot');
    }

    public function isScheduled(): bool
    {
        return $this->status === MatchStatus::Scheduled;
    }

    public function isAwaitingConfirmation(): bool
    {
        return $this->status === MatchStatus::AwaitingConfirmation;
    }

    public function isConfirmed(): bool
    {
        return $this->status === MatchStatus::Confirmed;
    }

    public function isCompleted(): bool
    {
        return $this->status === MatchStatus::Completed;
    }

    public function isDisputed(): bool
    {
        return $this->status === MatchStatus::Disputed;
    }

    public function needsAdminApproval(): bool
    {
        return $this->isConfirmed() || $this->isDisputed();
    }

    public function getScoresAttribute(): array
    {
        return [
            'team1' => $this->team1_score,
            'team2' => $this->team2_score,
        ];
    }
}
