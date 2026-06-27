<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchModel;
use App\Services\Contracts\FileUploadServiceInterface;
use App\Services\Contracts\MatchServiceInterface;
use App\Services\OcrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchController extends Controller
{
    public function __construct(
        private readonly MatchServiceInterface $matchService,
        private readonly FileUploadServiceInterface $fileUploadService,
        private readonly OcrService $ocrService
    ) {}

    public function show(int $id): JsonResponse
    {
        $match = MatchModel::with([
            'tournament',
            'team1.captain',
            'team2.captain',
            'winner',
            'results.submitter',
            'screenshots',
        ])->findOrFail($id);

        return response()->json(['match' => $match]);
    }

    public function submitResult(Request $request, int $matchId): JsonResponse
    {
        $request->validate([
            'score' => ['required', 'integer', 'min:0', 'max:99'],
            'notes' => ['nullable', 'string', 'max:500'],
            'screenshot' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $screenshot = null;
        if ($request->hasFile('screenshot')) {
            $screenshot = $this->fileUploadService->uploadMatchScreenshot(
                $request->file('screenshot'),
                $matchId
            );
        }

        $match = $this->matchService->submitResult(
            $matchId,
            $request->user()->teamMemberships->first()?->id ?? $request->input('team_id'),
            $request->input('score'),
            $screenshot,
            $request->input('notes', ''),
            $request->user()
        );

        return response()->json([
            'message' => 'Maç sonucu gönderildi.',
            'match' => $match,
        ]);
    }

    public function confirm(Request $request, int $matchId): JsonResponse
    {
        $teamId = $request->input('team_id');
        $match = $this->matchService->confirmResult($matchId, $teamId);

        return response()->json([
            'message' => 'Maç sonucu onaylandı.',
            'match' => $match,
        ]);
    }

    public function dispute(Request $request, int $matchId): JsonResponse
    {
        $request->validate(['reason' => 'required|string|min:10|max:1000']);

        $match = $this->matchService->dispute($matchId, $request->input('reason'));

        return response()->json([
            'message' => 'İhtilaflı maç bildirimi gönderildi. Admin onayı bekleniyor.',
            'match' => $match,
        ]);
    }

    public function schedule(Request $request, int $matchId): JsonResponse
    {
        $request->validate(['scheduled_at' => 'required|date|after:now']);

        $match = $this->matchService->schedule($matchId, $request->input('scheduled_at'));

        return response()->json([
            'message' => 'Maç takvimi oluşturuldu.',
            'match' => $match,
        ]);
    }

    public function myMatches(Request $request): JsonResponse
    {
        $user = $request->user();
        $teamIds = $user->teamMemberships->pluck('id')->merge($user->teams->pluck('id'))->unique();

        $matches = MatchModel::where(function ($query) use ($teamIds) {
            $query->whereIn('team1_id', $teamIds)
                ->orWhereIn('team2_id', $teamIds);
        })->with(['tournament', 'team1', 'team2', 'winner'])
            ->orderBy('scheduled_at', 'desc')
            ->paginate(20);

        return response()->json($matches);
    }
}
