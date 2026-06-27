<?php

namespace App\Services;

use App\Models\Ranking;
use App\Models\Season;
use App\Repositories\Contracts\RankingRepositoryInterface;
use App\Repositories\Contracts\TeamRepositoryInterface;
use App\Services\Contracts\RankingServiceInterface;

class RankingService implements RankingServiceInterface
{
    public function __construct(
        private readonly RankingRepositoryInterface $rankingRepository,
        private readonly TeamRepositoryInterface $teamRepository
    ) {}

    public function getGlobalRanking(int $perPage = 20)
    {
        return $this->rankingRepository->getGlobalRanking($perPage);
    }

    public function getBySeason(int $seasonId, int $perPage = 20)
    {
        return $this->rankingRepository->getBySeason($seasonId, $perPage);
    }

    public function getTeamRanking(int $teamId): ?array
    {
        $ranking = $this->rankingRepository->getByTeam($teamId);
        if (!$ranking) return null;

        return [
            'rank' => $ranking->rank,
            'points' => $ranking->points,
            'wins' => $ranking->wins,
            'losses' => $ranking->losses,
            'total_matches' => $ranking->total_matches,
            'win_rate' => $ranking->win_rate,
            'season' => $ranking->season?->name,
        ];
    }

    public function recalculateAll(): void
    {
        $this->rankingRepository->recalculateAll();
    }

    public function updateTeamRanking(int $teamId): void
    {
        $team = $this->teamRepository->findById($teamId);
        if (!$team) return;

        $activeSeason = Season::where('is_active', true)->first();
        if (!$activeSeason) return;

        $wins = $team->total_wins;
        $losses = $team->total_losses;
        $total = $wins + $losses;
        $winRate = $total > 0 ? round(($wins / $total) * 100, 2) : 0;
        $points = ($wins * 3) + ($losses * 0);

        Ranking::updateOrCreate(
            ['team_id' => $teamId, 'season_id' => $activeSeason->id],
            [
                'points' => $points,
                'wins' => $wins,
                'losses' => $losses,
                'total_matches' => $total,
                'win_rate' => $winRate,
            ]
        );
    }
}
