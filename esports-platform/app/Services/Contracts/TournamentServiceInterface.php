<?php

namespace App\Services\Contracts;

use App\Models\Tournament;

interface TournamentServiceInterface
{
    public function create(array $data): Tournament;
    public function update(int $tournamentId, array $data): Tournament;
    public function cancel(int $tournamentId, string $reason): Tournament;
    public function openRegistration(int $tournamentId): Tournament;
    public function registerTeam(int $tournamentId, int $teamId): void;
    public function unregisterTeam(int $tournamentId, int $teamId): void;
    public function start(int $tournamentId): Tournament;
    public function complete(int $tournamentId, int $winnerId): Tournament;
    public function setMatchResult(int $matchId, int $team1Score, int $team2Score): \App\Models\MatchModel;
    public function checkIn(int $tournamentId, int $teamId): void;
    public function getCheckInStatus(int $tournamentId): array;
}
