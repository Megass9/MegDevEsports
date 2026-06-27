<?php

namespace App\Services\Contracts;

use App\Models\Tournament;

interface BracketServiceInterface
{
    public function generate(Tournament $tournament): array;
    public function generateFromTeams(Tournament $tournament, $teams): array;
    public function getBracket(Tournament $tournament): array;
    public function advanceWinner(Tournament $tournament, int $matchId, int $winnerId): void;
}
