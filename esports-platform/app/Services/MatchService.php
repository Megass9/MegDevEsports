<?php

namespace App\Services;

use App\Enums\MatchStatus;
use App\Enums\NotificationType;
use App\Models\MatchModel;
use App\Models\User;
use App\Repositories\Contracts\MatchRepositoryInterface;
use App\Services\Contracts\BracketServiceInterface;
use App\Services\Contracts\MatchServiceInterface;
use App\Services\Contracts\NotificationServiceInterface;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class MatchService implements MatchServiceInterface
{
    public function __construct(
        private readonly MatchRepositoryInterface $matchRepository,
        private readonly BracketServiceInterface $bracketService,
        private readonly NotificationServiceInterface $notificationService,
        private readonly OcrService $ocrService,
    ) {}

    public function submitResult(int $matchId, int $teamId, int $score, ?string $screenshot, string $notes, User $submittedBy): MatchModel
    {
        $match = $this->matchRepository->findById($matchId);

        if (!$match) {
            throw ValidationException::withMessages(['match' => 'Maç bulunamadı.']);
        }

        if ($match->isCompleted()) {
            throw ValidationException::withMessages(['match' => 'Bu maç zaten tamamlandı.']);
        }

        if ($match->team1_id !== $teamId && $match->team2_id !== $teamId) {
            throw ValidationException::withMessages(['match' => 'Bu maçta yer alan bir takım değilsiniz.']);
        }

        $result = $match->results()->create([
            'team_id' => $teamId,
            'submitted_by' => $submittedBy->id,
            'score' => $score,
            'screenshot' => $screenshot,
            'notes' => $notes,
            'type' => 'result',
        ]);

        if ($screenshot) {
            $ocrResult = $this->ocrService->analyzeScreenshot($result);
            $result->refresh();
        }

        if ($match->team1_id === $teamId) {
            $match->update(['team1_score' => $score]);
        } else {
            $match->update(['team2_score' => $score]);
        }

        if ($match->team1_score !== null && $match->team2_score !== null) {
            $match->update(['status' => MatchStatus::AwaitingConfirmation, 'played_at' => now()]);
        } else {
            $match->update(['status' => MatchStatus::Ongoing]);
        }

        Cache::put("match_{$matchId}_updated", now()->timestamp, 86400);

        return $match->fresh();
    }

    public function confirmResult(int $matchId, int $teamId): MatchModel
    {
        $match = $this->matchRepository->findById($matchId);

        if (!$match || !$match->isAwaitingConfirmation()) {
            throw ValidationException::withMessages(['match' => 'Maç onay beklememektedir.']);
        }

        if ($match->team1_id === $teamId) {
            $match->update(['confirmed_by_team1' => true]);
        } elseif ($match->team2_id === $teamId) {
            $match->update(['confirmed_by_team2' => true]);
        } else {
            throw ValidationException::withMessages(['match' => 'Bu maçta yer alan bir takım değilsiniz.']);
        }

        if ($match->confirmed_by_team1 && $match->confirmed_by_team2) {
            $match->update(['status' => MatchStatus::Confirmed, 'confirmed_at' => now()]);
        }

        Cache::put("match_{$matchId}_updated", now()->timestamp, 86400);

        return $match->fresh();
    }

    public function confirmByAdmin(int $matchId): MatchModel
    {
        $match = $this->matchRepository->findById($matchId);

        if (!$match) {
            throw ValidationException::withMessages(['match' => 'Maç bulunamadı.']);
        }

        $winnerId = null;
        if ($match->team1_score > $match->team2_score) {
            $winnerId = $match->team1_id;
        } elseif ($match->team2_score > $match->team1_score) {
            $winnerId = $match->team2_id;
        }

        $match->update([
            'status' => MatchStatus::Completed,
            'winner_id' => $winnerId,
            'confirmed_at' => now(),
        ]);

        if ($winnerId) {
            $winner = \App\Models\Team::find($winnerId);
            $winner?->updateStats();
            $loserId = $winnerId === $match->team1_id ? $match->team2_id : $match->team1_id;
            $loser = \App\Models\Team::find($loserId);
            $loser?->updateStats();

            $this->bracketService->advanceWinner($match->tournament, $matchId, $winnerId);
        }

        Cache::put("match_{$matchId}_updated", now()->timestamp, 86400);

        return $match->fresh();
    }

    public function dispute(int $matchId, string $reason): MatchModel
    {
        $match = $this->matchRepository->findById($matchId);

        if (!$match) {
            throw ValidationException::withMessages(['match' => 'Maç bulunamadı.']);
        }

        $match->update([
            'status' => MatchStatus::Disputed,
            'disputed_at' => now(),
            'dispute_reason' => $reason,
        ]);

        Cache::put("match_{$matchId}_updated", now()->timestamp, 86400);

        return $match->fresh();
    }

    public function schedule(int $matchId, string $scheduledAt): MatchModel
    {
        $match = $this->matchRepository->findById($matchId);

        if (!$match) {
            throw ValidationException::withMessages(['match' => 'Maç bulunamadı.']);
        }

        $match->update(['scheduled_at' => $scheduledAt]);

        if ($match->team1) {
            foreach ($match->team1->members as $member) {
                $this->notificationService->send(
                    $member,
                    NotificationType::MatchReminder,
                    'Maç Planlandı',
                    "{$match->team1?->name} vs {$match->team2?->name} maçı {$scheduledAt} olarak planlandı.",
                    ['match_id' => $match->id]
                );
            }
        }

        Cache::put("match_{$matchId}_updated", now()->timestamp, 86400);

        return $match->fresh();
    }
}
