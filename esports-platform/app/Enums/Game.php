<?php

namespace App\Enums;

enum Game: string
{
    case Valorant = 'valorant';

    public function label(): string
    {
        return match ($this) {
            self::Valorant => 'Valorant',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
