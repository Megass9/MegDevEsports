<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Enums\UserRole;
use App\Models\Team;
use App\Models\User;
use App\Repositories\Contracts\TeamRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Services\Contracts\NotificationServiceInterface;
use App\Services\Contracts\TeamServiceInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TeamService implements TeamServiceInterface
{
    public function __construct(
        private readonly TeamRepositoryInterface $teamRepository,
        private readonly UserRepositoryInterface $userRepository,
        private readonly NotificationServiceInterface $notificationService
    ) {}

    public function create(array $data, User $captain): Team
    {
        if ($captain->teams()->count() >= 3) {
            throw ValidationException::withMessages(['team' => 'En fazla 3 takım oluşturabilirsiniz.']);
        }

        $team = DB::transaction(function () use ($data, $captain) {
            $team = $this->teamRepository->create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'game' => $data['game'] ?? 'valorant',
                'captain_id' => $captain->id,
            ]);

            $team->members()->attach($captain->id, ['is_substitute' => false]);

            if ($captain->role === UserRole::Player) {
                $captain->update(['role' => UserRole::TeamCaptain]);
            }

            return $team;
        });

        return $team->load(['captain', 'members']);
    }

    public function update(int $teamId, array $data): Team
    {
        $team = $this->teamRepository->findById($teamId);
        if (!$team) {
            throw ValidationException::withMessages(['team' => 'Takım bulunamadı.']);
        }

        return $this->teamRepository->update($teamId, $data);
    }

    public function delete(int $teamId): bool
    {
        return $this->teamRepository->delete($teamId);
    }

    public function invitePlayer(int $teamId, int $userId, User $invitedBy): void
    {
        $team = $this->teamRepository->findById($teamId);
        $user = $this->userRepository->findById($userId);

        if (!$team || !$user) {
            throw ValidationException::withMessages(['invitation' => 'Takım veya kullanıcı bulunamadı.']);
        }

        if (!$team->isCaptain($invitedBy)) {
            throw ValidationException::withMessages(['invitation' => 'Bu işlem için takım kaptanı olmalısınız.']);
        }

        if ($team->hasMember($user)) {
            throw ValidationException::withMessages(['invitation' => 'Bu kullanıcı zaten takım üyesi.']);
        }

        if (!$team->canAddMainPlayer() && !$team->canAddSubstitute()) {
            throw ValidationException::withMessages(['invitation' => 'Takım kontenjanı dolu.']);
        }

        $invitation = $team->teamInvitations()->create([
            'user_id' => $userId,
            'invited_by' => $invitedBy->id,
            'status' => 'pending',
            'expires_at' => now()->addDays(3),
        ]);

        $this->notificationService->send(
            $user,
            NotificationType::TeamInvitation,
            'Takım Daveti',
            "{$invitedBy->name} sizi {$team->name} takımına davet etti.",
            ['team_id' => $team->id, 'invitation_id' => $invitation->id]
        );
    }

    public function acceptInvitation(int $invitationId): bool
    {
        $invitation = \App\Models\TeamInvitation::findOrFail($invitationId);

        if ($invitation->isExpired()) {
            throw ValidationException::withMessages(['invitation' => 'Davet süresi doldu.']);
        }

        $team = $invitation->team;

        if ($team->isFull()) {
            throw ValidationException::withMessages(['invitation' => 'Takım kontenjanı dolu.']);
        }

        $isSubstitute = !$team->canAddMainPlayer();

        DB::transaction(function () use ($invitation, $team, $isSubstitute) {
            $team->members()->attach($invitation->user_id, ['is_substitute' => $isSubstitute]);
            $invitation->update(['status' => 'accepted', 'responded_at' => now()]);
        });

        return true;
    }

    public function declineInvitation(int $invitationId): bool
    {
        $invitation = \App\Models\TeamInvitation::findOrFail($invitationId);
        return $invitation->update(['status' => 'declined', 'responded_at' => now()]);
    }

    public function joinByCode(string $code, User $user): Team
    {
        $team = $this->teamRepository->findByCode($code);

        if (!$team) {
            throw ValidationException::withMessages(['code' => 'Geçersiz takım kodu.']);
        }

        if ($team->hasMember($user)) {
            throw ValidationException::withMessages(['code' => 'Zaten bu takımın üyesisiniz.']);
        }

        if ($team->isFull()) {
            throw ValidationException::withMessages(['code' => 'Takım kontenjanı dolu.']);
        }

        $isSubstitute = !$team->canAddMainPlayer();
        $team->members()->attach($user->id, ['is_substitute' => $isSubstitute]);

        return $team->load(['captain', 'members']);
    }

    public function leaveTeam(int $teamId, User $user): void
    {
        $team = $this->teamRepository->findById($teamId);

        if (!$team || !$team->hasMember($user)) {
            throw ValidationException::withMessages(['team' => 'Bu takımın üyesi değilsiniz.']);
        }

        if ($team->isCaptain($user)) {
            throw ValidationException::withMessages(['team' => 'Kaptan takımdan ayrılamaz. Yetki devretmelisiniz.']);
        }

        $team->members()->detach($user->id);
    }

    public function kickMember(int $teamId, int $userId): void
    {
        $team = $this->teamRepository->findById($teamId);
        $user = $this->userRepository->findById($userId);

        if (!$team || !$user) {
            throw ValidationException::withMessages(['team' => 'Takım veya kullanıcı bulunamadı.']);
        }

        if (!$team->hasMember($user)) {
            throw ValidationException::withMessages(['team' => 'Bu kullanıcı takım üyesi değil.']);
        }

        if ($team->isCaptain($user)) {
            throw ValidationException::withMessages(['team' => 'Kaptan takımdan çıkarılamaz.']);
        }

        $team->members()->detach($userId);

        $this->notificationService->send(
            $user,
            NotificationType::TeamKicked,
            'Takımdan Çıkarıldınız',
            "{$team->name} takımından çıkarıldınız.",
            ['team_id' => $team->id]
        );
    }

    public function transferCaptaincy(int $teamId, int $newCaptainId): Team
    {
        $team = $this->teamRepository->findById($teamId);
        $newCaptain = $this->userRepository->findById($newCaptainId);

        if (!$team || !$newCaptain) {
            throw ValidationException::withMessages(['team' => 'Takım veya kullanıcı bulunamadı.']);
        }

        if (!$team->hasMember($newCaptain)) {
            throw ValidationException::withMessages(['team' => 'Yeni kaptan takım üyesi olmalıdır.']);
        }

        DB::transaction(function () use ($team, $newCaptain) {
            $oldCaptain = $team->captain;
            $team->update(['captain_id' => $newCaptain->id]);

            if ($oldCaptain->teams()->count() === 0) {
                $oldCaptain->update(['role' => UserRole::Player]);
            }

            if ($newCaptain->role === UserRole::Player) {
                $newCaptain->update(['role' => UserRole::TeamCaptain]);
            }
        });

        return $team->fresh(['captain', 'members']);
    }

    public function updateLogo(int $teamId, $logo): Team
    {
        // Logo upload handled by FileUploadService
        return $this->teamRepository->update($teamId, ['logo' => $logo]);
    }
}
