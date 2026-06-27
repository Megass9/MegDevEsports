<?php

namespace App\Repositories;

use App\Enums\MatchStatus;
use App\Models\MatchModel;
use App\Repositories\Contracts\MatchRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class MatchRepository implements MatchRepositoryInterface
{
    public function findById(int $id): ?MatchModel
    {
        return MatchModel::with(['tournament', 'team1', 'team2', 'winner'])->find($id);
    }

    public function create(array $data): MatchModel
    {
        return MatchModel::create($data);
    }

    public function update(int $id, array $data): MatchModel
    {
        $match = $this->findById($id);
        $match->update($data);
        return $match->fresh();
    }

    public function delete(int $id): bool
    {
        return MatchModel::destroy($id) > 0;
    }

    public function getByTournament(int $tournamentId): Collection
    {
        return MatchModel::where('tournament_id', $tournamentId)
            ->with(['team1', 'team2', 'winner'])
            ->orderBy('round')
            ->orderBy('match_number')
            ->get();
    }

    public function getByTeam(int $teamId): Collection
    {
        return MatchModel::where(function ($query) use ($teamId) {
            $query->where('team1_id', $teamId)
                ->orWhere('team2_id', $teamId);
        })->with(['tournament', 'team1', 'team2', 'winner'])
            ->orderBy('scheduled_at', 'desc')
            ->get();
    }

    public function getPendingConfirmation(): Collection
    {
        return MatchModel::where('status', MatchStatus::AwaitingConfirmation->value)
            ->with(['tournament', 'team1', 'team2'])
            ->get();
    }

    public function getByRound(int $tournamentId, int $round): Collection
    {
        return MatchModel::where('tournament_id', $tournamentId)
            ->where('round', $round)
            ->with(['team1', 'team2'])
            ->orderBy('match_number')
            ->get();
    }

    public function count(): int
    {
        return MatchModel::count();
    }
}
