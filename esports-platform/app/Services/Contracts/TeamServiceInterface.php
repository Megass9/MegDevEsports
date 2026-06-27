<?php

namespace App\Services\Contracts;

use App\Models\Team;
use App\Models\User;

interface TeamServiceInterface
{
    public function create(array $data, User $captain): Team;
    public function update(int $teamId, array $data): Team;
    public function delete(int $teamId): bool;
    public function invitePlayer(int $teamId, int $userId, User $invitedBy): void;
    public function acceptInvitation(int $invitationId): bool;
    public function declineInvitation(int $invitationId): bool;
    public function joinByCode(string $code, User $user): Team;
    public function leaveTeam(int $teamId, User $user): void;
    public function kickMember(int $teamId, int $userId): void;
    public function transferCaptaincy(int $teamId, int $newCaptainId): Team;
    public function updateLogo(int $teamId, $logo): Team;
}
