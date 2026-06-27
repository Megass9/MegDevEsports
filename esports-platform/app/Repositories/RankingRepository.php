<?php

namespace App\Repositories;

use App\Models\Ranking;
use App\Models\Season;
use App\Models\Team;
use App\Repositories\Contracts\RankingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class RankingRepository implements RankingRepositoryInterface
{
    public function findById(int $id): ?Ranking
    {
        return Ranking::with(['team', 'season'])->find($id);
    }

    public function create(array $data): Ranking
    {
        return Ranking::create($data);
    }

    public function update(int $id, array $data): Ranking
    {
        $ranking = $this->findById($id);
        $ranking->update($data);
        return $ranking->fresh();
    }

    public function getGlobalRanking(int $perPage = 20)
    {
        return Ranking::with('team.captain')
            ->whereHas('season', function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy('points', 'desc')
            ->orderBy('win_rate', 'desc')
            ->orderBy('wins', 'desc')
            ->paginate($perPage);
    }

    public function getBySeason(int $seasonId, int $perPage = 20)
    {
        return Ranking::with('team.captain')
            ->where('season_id', $seasonId)
            ->orderBy('points', 'desc')
            ->orderBy('win_rate', 'desc')
            ->orderBy('wins', 'desc')
            ->paginate($perPage);
    }

    public function getByTeam(int $teamId): ?Ranking
    {
        return Ranking::with('season')
            ->where('team_id', $teamId)
            ->whereHas('season', function ($query) {
                $query->where('is_active', true);
            })
            ->first();
    }

    public function recalculateAll(): void
    {
        $activeSeason = Season::where('is_active', true)->first();
        if (!$activeSeason) return;

        $teams = Team::where('is_active', true)->get();

        foreach ($teams as $team) {
            $wins = $team->total_wins;
            $losses = $team->total_losses;
            $total = $wins + $losses;
            $winRate = $total > 0 ? round(($wins / $total) * 100, 2) : 0;
            $points = ($wins * 3) + ($losses * 0);

            Ranking::updateOrCreate(
                ['team_id' => $team->id, 'season_id' => $activeSeason->id],
                [
                    'points' => $points,
                    'wins' => $wins,
                    'losses' => $losses,
                    'total_matches' => $total,
                    'win_rate' => $winRate,
                ]
            );
        }

        $rankings = Ranking::where('season_id', $activeSeason->id)
            ->orderBy('points', 'desc')
            ->orderBy('win_rate', 'desc')
            ->orderBy('wins', 'desc')
            ->get();

        $rank = 1;
        foreach ($rankings as $ranking) {
            $ranking->update(['rank' => $rank]);
            $rank++;
        }
    }

    public function delete(int $id): bool
    {
        return Ranking::destroy($id) > 0;
    }
}
