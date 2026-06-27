<?php

namespace App\Repositories;

use App\Enums\TournamentStatus;
use App\Models\Tournament;
use App\Repositories\Contracts\TournamentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TournamentRepository implements TournamentRepositoryInterface
{
    public function findById(int $id): ?Tournament
    {
        return Tournament::with(['participants', 'winner'])->find($id);
    }

    public function create(array $data): Tournament
    {
        return Tournament::create($data);
    }

    public function update(int $id, array $data): Tournament
    {
        $tournament = $this->findById($id);
        $tournament->update($data);
        return $tournament->fresh();
    }

    public function delete(int $id): bool
    {
        return Tournament::destroy($id) > 0;
    }

    public function all(): Collection
    {
        return Tournament::orderBy('start_date', 'desc')->get();
    }

    public function paginate(int $perPage = 15)
    {
        return Tournament::withCount('participants')
            ->orderBy('start_date', 'desc')
            ->paginate($perPage);
    }

    public function getActive(): Collection
    {
        return Tournament::whereIn('status', [
            TournamentStatus::Registration->value,
            TournamentStatus::InProgress->value,
        ])->orderBy('start_date', 'asc')->get();
    }

    public function getCompleted(): Collection
    {
        return Tournament::where('status', TournamentStatus::Completed->value)
            ->orderBy('completed_at', 'desc')
            ->get();
    }

    public function getUpcoming(): Collection
    {
        return Tournament::where('status', TournamentStatus::Pending->value)
            ->orderBy('start_date', 'asc')
            ->get();
    }

    public function getByGame(string $game): Collection
    {
        return Tournament::where('game', $game)
            ->orderBy('start_date', 'desc')
            ->get();
    }

    public function count(): int
    {
        return Tournament::count();
    }

    public function countActive(): int
    {
        return Tournament::whereIn('status', [
            TournamentStatus::Registration->value,
            TournamentStatus::InProgress->value,
        ])->count();
    }
}
