<?php

namespace App\Repositories\Contracts;

use App\Models\MatchModel;
use Illuminate\Database\Eloquent\Collection;

interface MatchRepositoryInterface
{
    public function findById(int $id): ?MatchModel;
    public function create(array $data): MatchModel;
    public function update(int $id, array $data): MatchModel;
    public function delete(int $id): bool;
    public function getByTournament(int $tournamentId): Collection;
    public function getByTeam(int $teamId): Collection;
    public function getPendingConfirmation(): Collection;
    public function getByRound(int $tournamentId, int $round): Collection;
    public function count(): int;
}
