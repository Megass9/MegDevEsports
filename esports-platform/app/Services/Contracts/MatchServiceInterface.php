<?php

namespace App\Services\Contracts;

use App\Models\MatchModel;
use App\Models\User;

interface MatchServiceInterface
{
    public function submitResult(int $matchId, int $teamId, int $score, ?string $screenshot, string $notes, User $submittedBy): MatchModel;
    public function confirmResult(int $matchId, int $teamId): MatchModel;
    public function confirmByAdmin(int $matchId): MatchModel;
    public function dispute(int $matchId, string $reason): MatchModel;
    public function schedule(int $matchId, string $scheduledAt): MatchModel;
}
