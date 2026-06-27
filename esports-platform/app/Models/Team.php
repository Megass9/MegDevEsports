<?php

namespace App\Models;

use App\Enums\Game;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Team extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'code',
        'description',
        'logo',
        'captain_id',
        'game',
        'is_active',
        'total_wins',
        'total_losses',
        'total_matches',
        'win_rate',
        'points',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'game' => Game::class,
            'total_wins' => 'integer',
            'total_losses' => 'integer',
            'total_matches' => 'integer',
            'win_rate' => 'float',
            'points' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Team $team) {
            $team->slug = Str::slug($team->name);
            $team->code = strtoupper(Str::random(8));
        });
    }

    public function captain(): BelongsTo
    {
        return $this->belongsTo(User::class, 'captain_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_members')
            ->withPivot('is_substitute')
            ->withTimestamps();
    }

    public function mainPlayers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_members')
            ->wherePivot('is_substitute', false)
            ->withTimestamps();
    }

    public function substitutePlayers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_members')
            ->wherePivot('is_substitute', true)
            ->withTimestamps();
    }

    public function teamInvitations(): HasMany
    {
        return $this->hasMany(TeamInvitation::class);
    }

    public function tournaments()
    {
        return $this->belongsToMany(Tournament::class, 'tournament_participants')
            ->withTimestamps();
    }

    public function matches(): HasMany
    {
        return $this->hasMany(MatchModel::class, 'team1_id')
            ->orWhere('team2_id', $this->id);
    }

    public function ranking()
    {
        return $this->hasOne(Ranking::class);
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'team_id');
    }

    public function mainPlayerCount(): int
    {
        return $this->mainPlayers()->count();
    }

    public function substituteCount(): int
    {
        return $this->substitutePlayers()->count();
    }

    public function totalMembers(): int
    {
        return $this->members()->count();
    }

    public function isFull(): bool
    {
        return $this->mainPlayerCount() >= 5 && $this->substituteCount() >= 2;
    }

    public function isCaptain(User $user): bool
    {
        return $this->captain_id === $user->id;
    }

    public function hasMember(User $user): bool
    {
        return $this->members()->where('user_id', $user->id)->exists();
    }

    public function getLogoUrlAttribute(): string
    {
        return $this->logo
            ? asset('storage/team-logos/'.$this->logo)
            : null;
    }

    public function canAddMainPlayer(): bool
    {
        return $this->mainPlayerCount() < 5;
    }

    public function canAddSubstitute(): bool
    {
        return $this->substituteCount() < 2;
    }

    public function updateStats(): void
    {
        $wins = $this->matches()->where('winner_id', $this->id)->where('status', 'completed')->count();
        $losses = $this->matches()->where('status', 'completed')
            ->whereNotNull('winner_id')
            ->where('winner_id', '!=', $this->id)
            ->count();
        $total = $wins + $losses;

        $this->update([
            'total_wins' => $wins,
            'total_losses' => $losses,
            'total_matches' => $total,
            'win_rate' => $total > 0 ? round(($wins / $total) * 100, 2) : 0,
        ]);
    }
}
