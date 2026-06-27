<?php

namespace App\Services\Contracts;

interface RankingServiceInterface
{
    public function getGlobalRanking(int $perPage = 20);
    public function getBySeason(int $seasonId, int $perPage = 20);
    public function getTeamRanking(int $teamId): ?array;
    public function recalculateAll(): void;
    public function updateTeamRanking(int $teamId): void;
}
