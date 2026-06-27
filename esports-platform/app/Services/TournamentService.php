<?php

namespace App\Services;

use App\Enums\MatchStatus;
use App\Enums\NotificationType;
use App\Enums\TournamentFormat;
use App\Enums\TournamentStatus;
use App\Models\Tournament;
use App\Repositories\Contracts\TournamentRepositoryInterface;
use App\Models\ChatRoom;
use App\Services\Contracts\BracketServiceInterface;
use App\Services\Contracts\ChatServiceInterface;
use App\Services\Contracts\NotificationServiceInterface;
use App\Services\Contracts\TournamentServiceInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class TournamentService implements TournamentServiceInterface
{
    public function __construct(
        private readonly TournamentRepositoryInterface $tournamentRepository,
        private readonly BracketServiceInterface $bracketService,
        private readonly NotificationServiceInterface $notificationService,
        private readonly ChatServiceInterface $chatService
    ) {}

    public function create(array $data): Tournament
    {
        $tournament = $this->tournamentRepository->create([
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'game' => $data['game'] ?? 'valorant',
            'type' => $data['type'] ?? TournamentFormat::SingleElimination->value,
            'status' => TournamentStatus::Pending,
            'max_teams' => $data['max_teams'],
            'entry_fee' => $data['entry_fee'] ?? 0,
            'prize_pool' => $data['prize_pool'] ?? 0,
            'prize_description' => $data['prize_description'] ?? null,
            'start_date' => $data['start_date'],
            'registration_end_date' => $data['registration_end_date'] ?? null,
        ]);

        $this->chatService->createRoom($tournament->id, $tournament->name);

        return $tournament;
    }

    public function update(int $tournamentId, array $data): Tournament
    {
        $tournament = $this->tournamentRepository->findById($tournamentId);
        if (!$tournament) {
            throw ValidationException::withMessages(['tournament' => 'Turnuva bulunamadı.']);
        }

        return $this->tournamentRepository->update($tournamentId, $data);
    }

    public function openRegistration(int $tournamentId): Tournament
    {
        $tournament = $this->tournamentRepository->findById($tournamentId);
        if (!$tournament) {
            throw ValidationException::withMessages(['tournament' => 'Turnuva bulunamadı.']);
        }

        return $this->tournamentRepository->update($tournamentId, [
            'status' => TournamentStatus::Registration,
        ]);
    }

    public function cancel(int $tournamentId, string $reason): Tournament
    {
        $tournament = $this->tournamentRepository->findById($tournamentId);
        if (!$tournament) {
            throw ValidationException::withMessages(['tournament' => 'Turnuva bulunamadı.']);
        }

        $tournament = $this->tournamentRepository->update($tournamentId, [
            'status' => TournamentStatus::Cancelled,
            'cancelled_at' => now(),
            'cancelled_reason' => $reason,
        ]);

        foreach ($tournament->participants as $team) {
            $this->notificationService->sendToMany(
                $team->members->all(),
                NotificationType::SystemAnnouncement,
                'Turnuva İptal Edildi',
                "{$tournament->name} turnuvası iptal edildi. Sebep: {$reason}",
                ['tournament_id' => $tournament->id]
            );
        }

        return $tournament;
    }

    public function registerTeam(int $tournamentId, int $teamId): void
    {
        $tournament = $this->tournamentRepository->findById($tournamentId);

        if (!$tournament->canRegister()) {
            throw ValidationException::withMessages(['registration' => 'Turnuvaya kayıt şu an açık değil veya kontenjan dolu.']);
        }

        if ($tournament->participants()->where('team_id', $teamId)->exists()) {
            throw ValidationException::withMessages(['registration' => 'Bu takım zaten turnuvaya kayıtlı.']);
        }

        $tournament->participants()->attach($teamId, ['seed' => $tournament->currentTeamCount() + 1]);
    }

    public function unregisterTeam(int $tournamentId, int $teamId): void
    {
        $tournament = $this->tournamentRepository->findById($tournamentId);

        if (!$tournament->isRegistrationOpen()) {
            throw ValidationException::withMessages(['registration' => 'Kayıt dönemi kapandı.']);
        }

        $tournament->participants()->detach($teamId);
    }

    public function checkIn(int $tournamentId, int $teamId): void
    {
        $tournament = $this->tournamentRepository->findById($tournamentId);

        if (!$tournament) {
            throw ValidationException::withMessages(['tournament' => 'Turnuva bulunamadı.']);
        }

        if ($tournament->status !== TournamentStatus::Registration && $tournament->status !== TournamentStatus::Pending) {
            throw ValidationException::withMessages(['checkin' => 'Check-in süresi geçti.']);
        }

        $participant = $tournament->participants()->where('team_id', $teamId)->first();

        if (!$participant) {
            throw ValidationException::withMessages(['checkin' => 'Bu takım turnuvaya kayıtlı değil.']);
        }

        if ($participant->pivot->checked_in_at) {
            throw ValidationException::withMessages(['checkin' => 'Bu takım zaten check-in yapmış.']);
        }

        $tournament->participants()->updateExistingPivot($teamId, [
            'checked_in_at' => now(),
        ]);
    }

    public function getCheckInStatus(int $tournamentId): array
    {
        $tournament = $this->tournamentRepository->findById($tournamentId);

        if (!$tournament) {
            throw ValidationException::withMessages(['tournament' => 'Turnuva bulunamadı.']);
        }

        $participants = $tournament->participants()->with('captain')->get();

        $totalTeams = $participants->count();
        $checkedIn = $participants->filter(fn($t) => $t->pivot->checked_in_at !== null)->count();
        $disqualified = $participants->filter(fn($t) => $t->pivot->disqualified)->count();

        return [
            'total_teams' => $totalTeams,
            'checked_in' => $checkedIn,
            'disqualified' => $disqualified,
            'participants' => $participants->map(function ($team) {
                return [
                    'id' => $team->id,
                    'name' => $team->name,
                    'tag' => $team->tag,
                    'logo' => $team->logo,
                    'captain' => $team->captain ? ['id' => $team->captain->id, 'name' => $team->captain->name] : null,
                    'checked_in_at' => $team->pivot->checked_in_at,
                    'disqualified' => $team->pivot->disqualified,
                ];
            }),
        ];
    }

    public function start(int $tournamentId): Tournament
    {
        $tournament = $this->tournamentRepository->findById($tournamentId);

        if (!$tournament) {
            throw ValidationException::withMessages(['tournament' => 'Turnuva bulunamadı.']);
        }

        if ($tournament->participants()->count() < 2) {
            throw ValidationException::withMessages(['tournament' => 'Turnuva başlamak için en az 2 takım gerekli.']);
        }

        DB::transaction(function () use ($tournament) {
            $now = now();

            $tournament->participants()
                ->wherePivot('checked_in_at', null)
                ->wherePivot('disqualified', false)
                ->update(['disqualified' => true]);

            $activeParticipants = $tournament->participants()
                ->wherePivot('disqualified', false)
                ->get();

            if ($activeParticipants->count() < 2) {
                throw ValidationException::withMessages(['tournament' => 'Check-in yapan takım sayısı yetersiz (en az 2 gerekli).']);
            }

            $bracketData = $this->bracketService->generateFromTeams($tournament, $activeParticipants);

            $tournament->update([
                'status' => TournamentStatus::InProgress,
                'bracket_json' => $bracketData,
            ]);

            foreach ($tournament->participants as $team) {
                foreach ($team->members as $member) {
                    $this->notificationService->send(
                        $member,
                        NotificationType::TournamentStart,
                        'Turnuva Başladı!',
                        "{$tournament->name} turnuvası başladı. Maç takviminizi kontrol edin.",
                        ['tournament_id' => $tournament->id]
                    );
                }
            }
        });

        return $tournament->fresh();
    }

    public function complete(int $tournamentId, int $winnerId): Tournament
    {
        $tournament = $this->tournamentRepository->findById($tournamentId);

        $this->tournamentRepository->update($tournamentId, [
            'status' => TournamentStatus::Completed,
            'winner_id' => $winnerId,
            'completed_at' => now(),
        ]);

        return $tournament->fresh();
    }

    public function setMatchResult(int $matchId, int $team1Score, int $team2Score): \App\Models\MatchModel
    {
        $match = \App\Models\MatchModel::findOrFail($matchId);

        $winnerId = null;
        if ($team1Score > $team2Score) {
            $winnerId = $match->team1_id;
        } elseif ($team2Score > $team1Score) {
            $winnerId = $match->team2_id;
        }

        $match->update([
            'team1_score' => $team1Score,
            'team2_score' => $team2Score,
            'winner_id' => $winnerId,
            'status' => \App\Enums\MatchStatus::Completed,
            'confirmed_at' => now(),
        ]);

        if ($winnerId) {
            $winner = \App\Models\Team::find($winnerId);
            $winner?->updateStats();
        }

        Cache::put("match_{$matchId}_updated", now()->timestamp, 86400);

        return $match->fresh(['team1', 'team2', 'winner']);
    }
}
