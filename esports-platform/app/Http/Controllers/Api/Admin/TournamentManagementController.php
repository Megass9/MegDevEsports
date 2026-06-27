<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Tournament\CreateTournamentRequest;
use App\Models\MatchResult;
use App\Models\Tournament;
use App\Services\Contracts\AdminLogServiceInterface;
use App\Services\Contracts\TournamentServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

use App\Services\OcrService;

class TournamentManagementController extends Controller
{
    public function __construct(
        private readonly TournamentServiceInterface $tournamentService,
        private readonly AdminLogServiceInterface $adminLogService,
        private readonly OcrService $ocrService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Tournament::withCount('participants');

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $tournaments = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($tournaments);
    }

    public function store(CreateTournamentRequest $request): JsonResponse
    {
        $tournament = $this->tournamentService->create($request->validated());

        $this->adminLogService->log(
            $request->user(),
            'create_tournament',
            'tournament',
            $tournament->id,
            "{$tournament->name} turnuvası oluşturuldu."
        );

        return response()->json([
            'message' => 'Turnuva başarıyla oluşturuldu.',
            'tournament' => $tournament,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tournament = $this->tournamentService->update($id, $request->all());

        $this->adminLogService->log(
            $request->user(),
            'update_tournament',
            'tournament',
            $id,
            "{$tournament->name} turnuvası güncellendi."
        );

        return response()->json([
            'message' => 'Turnuva güncellendi.',
            'tournament' => $tournament,
        ]);
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $tournament = $this->tournamentService->cancel($id, $request->input('reason'));

        $this->adminLogService->log(
            $request->user(),
            'cancel_tournament',
            'tournament',
            $id,
            "{$tournament->name} turnuvası iptal edildi. Sebep: {$request->input('reason')}"
        );

        return response()->json([
            'message' => 'Turnuva iptal edildi.',
            'tournament' => $tournament,
        ]);
    }

    public function openRegistration(Request $request, int $id): JsonResponse
    {
        $tournament = $this->tournamentService->openRegistration($id);

        $this->adminLogService->log(
            $request->user(),
            'open_registration',
            'tournament',
            $id,
            "{$tournament->name} turnuvası kayda açıldı."
        );

        return response()->json([
            'message' => 'Turnuva kayda açıldı.',
            'tournament' => $tournament,
        ]);
    }

    public function start(Request $request, int $id): JsonResponse
    {
        $tournament = $this->tournamentService->start($id);

        $this->adminLogService->log(
            $request->user(),
            'start_tournament',
            'tournament',
            $id,
            "{$tournament->name} turnuvası başlatıldı."
        );

        return response()->json([
            'message' => 'Turnuva başlatıldı.',
            'tournament' => $tournament,
        ]);
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $request->validate(['winner_id' => 'required|exists:teams,id']);

        $tournament = $this->tournamentService->complete($id, $request->input('winner_id'));

        $this->adminLogService->log(
            $request->user(),
            'complete_tournament',
            'tournament',
            $id,
            "{$tournament->name} turnuvası tamamlandı."
        );

        return response()->json([
            'message' => 'Turnuva tamamlandı.',
            'tournament' => $tournament,
        ]);
    }

    public function confirmMatch(Request $request, int $matchId): JsonResponse
    {
        $match = \App\Models\MatchModel::findOrFail($matchId);

        $winnerId = null;
        if ($match->team1_score > $match->team2_score) {
            $winnerId = $match->team1_id;
        } elseif ($match->team2_score > $match->team1_score) {
            $winnerId = $match->team2_id;
        }

        $match->update([
            'status' => 'completed',
            'winner_id' => $winnerId,
            'confirmed_at' => now(),
        ]);

        if ($winnerId) {
            $winner = \App\Models\Team::find($winnerId);
            $winner?->updateStats();
        }

        $this->adminLogService->log(
            $request->user(),
            'confirm_match',
            'match',
            $matchId,
            "Maç #{$matchId} admin tarafından onaylandı."
        );

        Cache::put("match_{$matchId}_updated", now()->timestamp, 86400);

        return response()->json([
            'message' => 'Maç onaylandı.',
            'match' => $match->fresh(),
        ]);
    }

    public function setMatchResult(Request $request, int $matchId): JsonResponse
    {
        $request->validate([
            'team1_score' => 'required|integer|min:0',
            'team2_score' => 'required|integer|min:0',
        ]);

        $match = $this->tournamentService->setMatchResult(
            $matchId,
            (int) $request->input('team1_score'),
            (int) $request->input('team2_score')
        );

        $this->adminLogService->log(
            $request->user(),
            'set_match_result',
            'match',
            $matchId,
            "Maç #{$matchId} sonucu {$match->team1_score}-{$match->team2_score} olarak girildi."
        );

        Cache::put("match_{$matchId}_updated", now()->timestamp, 86400);

        return response()->json([
            'message' => 'Maç sonucu kaydedildi.',
            'match' => $match,
        ]);
    }

    public function checkInStatus(int $id): JsonResponse
    {
        $status = $this->tournamentService->getCheckInStatus($id);

        return response()->json($status);
    }

    public function resolveDispute(Request $request, int $matchId): JsonResponse
    {
        $request->validate([
            'action' => 'required|string|in:confirm,set_result',
            'team1_score' => 'required_if:action,set_result|integer|min:0',
            'team2_score' => 'required_if:action,set_result|integer|min:0',
        ]);

        $match = \App\Models\MatchModel::findOrFail($matchId);

        if ($request->input('action') === 'set_result') {
            $match = $this->tournamentService->setMatchResult(
                $matchId,
                (int) $request->input('team1_score'),
                (int) $request->input('team2_score')
            );
        }

        $match->update([
            'status' => 'completed',
            'disputed_at' => null,
            'dispute_reason' => null,
        ]);

        $this->adminLogService->log(
            $request->user(),
            'resolve_dispute',
            'match',
            $matchId,
            "Maç #{$matchId} ihtilafı çözüldü."
        );

        return response()->json([
            'message' => 'İhtilaf çözüldü.',
            'match' => $match->fresh(),
        ]);
    }

    public function acceptOcr(int $matchResultId): JsonResponse
    {
        $result = MatchResult::with('match')->findOrFail($matchResultId);
        $match = $result->match;

        if ($result->ocr_status === 'rejected') {
            return response()->json(['message' => 'OCR sonucu zaten reddedildi.'], 422);
        }

        if ($result->ocr_team1_score === null || $result->ocr_team2_score === null) {
            return response()->json(['message' => 'OCR verisi eksik.'], 422);
        }

        $this->tournamentService->setMatchResult(
            $match->id,
            $result->ocr_team1_score,
            $result->ocr_team2_score
        );

        $result->update(['ocr_status' => 'accepted']);

        return response()->json([
            'message' => 'OCR sonucu kabul edildi ve maç tamamlandı.',
            'match' => $match->fresh(['team1', 'team2', 'winner']),
        ]);
    }

    public function rejectOcr(int $matchResultId): JsonResponse
    {
        $result = MatchResult::findOrFail($matchResultId);
        $result->update(['ocr_status' => 'rejected']);

        return response()->json(['message' => 'OCR sonucu reddedildi.']);
    }

    public function reanalyzeOcr(int $matchResultId): JsonResponse
    {
        $result = MatchResult::with('match')->findOrFail($matchResultId);
        $data = $this->ocrService->analyzeScreenshot($result);

        return response()->json([
            'message' => 'OCR yeniden analiz edildi.',
            'ocr' => $data,
            'result' => $result->fresh(),
        ]);
    }
}
