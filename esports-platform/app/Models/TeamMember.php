<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class TeamMember extends Pivot
{
    use HasFactory;

    protected $table = 'team_members';

    protected $fillable = [
        'team_id',
        'user_id',
        'is_substitute',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'is_substitute' => 'boolean',
            'joined_at' => 'datetime',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
