<?php

namespace App\Enums;

enum MatchStatus: string
{
    case Scheduled = 'scheduled';
    case Ongoing = 'ongoing';
    case AwaitingConfirmation = 'awaiting_confirmation';
    case Confirmed = 'confirmed';
    case Disputed = 'disputed';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Scheduled => 'Planlandı',
            self::Ongoing => 'Devam Ediyor',
            self::AwaitingConfirmation => 'Onay Bekliyor',
            self::Confirmed => 'Onaylandı',
            self::Disputed => 'İhtilaflı',
            self::Completed => 'Tamamlandı',
        };
    }
}
