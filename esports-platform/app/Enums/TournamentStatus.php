<?php

namespace App\Enums;

enum TournamentStatus: string
{
    case Pending = 'pending';
    case Registration = 'registration';
    case InProgress = 'in_progress';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Beklemede',
            self::Registration => 'Kayıt Açık',
            self::InProgress => 'Devam Ediyor',
            self::Completed => 'Tamamlandı',
            self::Cancelled => 'İptal Edildi',
        };
    }
}
