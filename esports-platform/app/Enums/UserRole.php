<?php

namespace App\Enums;

enum UserRole: string
{
    case Player = 'player';
    case TeamCaptain = 'team_captain';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Player => 'Oyuncu',
            self::TeamCaptain => 'Takım Kaptanı',
            self::Admin => 'Admin',
        };
    }
}
