<?php

namespace App\Models;

use App\Enums\Game;
use App\Enums\TournamentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tournament extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'game',
        'type',
        'status',
        'max_teams',
        'entry_fee',
        'prize_pool',
        'prize_description',
        'start_date',
        'registration_end_date',
        'bracket_json',
        'winner_id',
        'cancelled_at',
        'cancelled_reason',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'game' => Game::class,
            'status' => TournamentStatus::class,
            'max_teams' => 'integer',
            'entry_fee' => 'float',
            'prize_pool' => 'float',
            'start_date' => 'datetime',
            'registration_end_date' => 'datetime',
            'bracket_json' => 'json',
            'cancelled_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'tournament_participants')
            ->withPivot('seed', 'eliminated_at', 'rank', 'checked_in_at', 'disqualified')
            ->withTimestamps();
    }

    public function checkedInParticipants(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'tournament_participants')
            ->withPivot('seed', 'eliminated_at', 'rank', 'checked_in_at', 'disqualified')
            ->wherePivot('checked_in_at', '!=', null)
            ->wherePivot('disqualified', false)
            ->withTimestamps();
    }

    public function matches(): HasMany
    {
        return $this->hasMany(MatchModel::class);
    }

    public function winner()
    {
        return $this->belongsTo(Team::class, 'winner_id');
    }

    public function rewards(): HasMany
    {
        return $this->hasMany(Reward::class);
    }

    public function chatRooms(): HasMany
    {
        return $this->hasMany(ChatRoom::class);
    }

    public function isFull(): bool
    {
        return $this->participants()->count() >= $this->max_teams;
    }

    public function isRegistrationOpen(): bool
    {
        return $this->status === TournamentStatus::Registration;
    }

    public function isInProgress(): bool
    {
        return $this->status === TournamentStatus::InProgress;
    }

    public function canRegister(): bool
    {
        return $this->isRegistrationOpen() && !$this->isFull();
    }

    public function currentTeamCount(): int
    {
        return $this->participants()->count();
    }

    public function bracketData(): ?array
    {
        return $this->bracket_json;
    }
}
