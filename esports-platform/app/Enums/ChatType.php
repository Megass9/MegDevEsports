<?php

namespace App\Enums;

enum ChatType: string
{
    case Global = 'global';
    case Team = 'team';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Global => 'Genel Sohbet',
            self::Team => 'Takım Sohbeti',
            self::Admin => 'Admin Sohbeti',
        };
    }
}
