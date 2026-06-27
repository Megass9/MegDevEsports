<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'riot_id',
        'email_verified_at',
        'is_banned',
        'banned_at',
        'last_active_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_banned' => 'boolean',
            'banned_at' => 'datetime',
            'last_active_at' => 'datetime',
            'role' => UserRole::class,
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    public function isTeamCaptain(): bool
    {
        return $this->role === UserRole::TeamCaptain;
    }

    public function isPlayer(): bool
    {
        return $this->role === UserRole::Player;
    }

    public function isBanned(): bool
    {
        return (bool) $this->is_banned;
    }

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class, 'captain_id');
    }

    public function teamMemberships(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_members')
            ->withPivot('is_substitute')
            ->withTimestamps();
    }

    public function chatMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function adminLogs(): HasMany
    {
        return $this->hasMany(AdminLog::class, 'admin_id');
    }

    public function getAvatarUrlAttribute(): string
    {
        return $this->avatar
            ? asset('storage/avatars/'.$this->avatar)
            : 'https://ui-avatars.com/api/?name='.urlencode($this->name).'&background=ff4655&color=fff';
    }
}
