<?php

namespace App\Enums;

enum TournamentFormat: string
{
    case SingleElimination = 'single_elimination';
    case DoubleElimination = 'double_elimination';
    case RoundRobin = 'round_robin';
    case Swiss = 'swiss';

    public function label(): string
    {
        return match ($this) {
            self::SingleElimination => 'Tek Eleme',
            self::DoubleElimination => 'Çift Eleme',
            self::RoundRobin => 'Round Robin',
            self::Swiss => 'İsviçre',
        };
    }
}
