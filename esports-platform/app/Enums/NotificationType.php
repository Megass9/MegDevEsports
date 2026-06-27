<?php

namespace App\Enums;

enum NotificationType: string
{
    case TournamentStart = 'tournament_start';
    case TeamInvitation = 'team_invitation';
    case MatchReminder = 'match_reminder';
    case MatchResult = 'match_result';
    case SystemAnnouncement = 'system_announcement';
    case TeamKicked = 'team_kicked';

    public function label(): string
    {
        return match ($this) {
            self::TournamentStart => 'Turnuva Başlangıcı',
            self::TeamInvitation => 'Takım Daveti',
            self::MatchReminder => 'Maç Saati',
            self::MatchResult => 'Maç Sonucu',
            self::SystemAnnouncement => 'Sistem Duyurusu',
            self::TeamKicked => 'Takımdan Çıkarılma',
        };
    }
}
