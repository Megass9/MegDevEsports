<?php

namespace App\Repositories\Contracts;

use App\Models\Ranking;
use Illuminate\Database\Eloquent\Collection;

interface RankingRepositoryInterface
{
    public function findById(int $id): ?Ranking;
    public function create(array $data): Ranking;
    public function update(int $id, array $data): Ranking;
    public function getGlobalRanking(int $perPage = 20);
    public function getBySeason(int $seasonId, int $perPage = 20);
    public function getByTeam(int $teamId): ?Ranking;
    public function recalculateAll(): void;
    public function delete(int $id): bool;
}
