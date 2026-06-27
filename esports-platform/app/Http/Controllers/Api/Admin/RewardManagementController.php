<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reward;
use App\Models\Tournament;
use App\Services\Contracts\AdminLogServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RewardManagementController extends Controller
{
    public function __construct(
        private readonly AdminLogServiceInterface $adminLogService
    ) {}

    public function index(): JsonResponse
    {
        $rewards = Reward::with(['tournament', 'team', 'approver'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($rewards);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'tournament_id' => 'required|exists:tournaments,id',
            'team_id' => 'required|exists:teams,id',
            'rank' => 'required|integer|min:1',
            'prize' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
        ]);

        $reward = Reward::create($request->all());

        $this->adminLogService->log(
            $request->user(),
            'create_reward',
            'reward',
            $reward->id,
            "{$reward->team?->name} takımına ödül eklendi: {$reward->prize}"
        );

        return response()->json([
            'message' => 'Ödül başarıyla eklendi.',
            'reward' => $reward->load(['tournament', 'team']),
        ], 201);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $reward = Reward::findOrFail($id);
        $reward->update([
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        $this->adminLogService->log(
            $request->user(),
            'approve_reward',
            'reward',
            $id,
            "{$reward->team?->name} takımının ödülü onaylandı: {$reward->prize}"
        );

        return response()->json([
            'message' => 'Ödül onaylandı. Ödül manuel olarak gönderilecektir.',
            'reward' => $reward->fresh(),
        ]);
    }

    public function markDelivered(Request $request, int $id): JsonResponse
    {
        $reward = Reward::findOrFail($id);
        $reward->update(['delivered_at' => now(), 'notes' => $request->input('notes')]);

        $this->adminLogService->log(
            $request->user(),
            'deliver_reward',
            'reward',
            $id,
            "{$reward->team?->name} takımının ödülü teslim edildi."
        );

        return response()->json([
            'message' => 'Ödül teslim edildi olarak işaretlendi.',
        ]);
    }

    public function tournamentRewards(int $tournamentId): JsonResponse
    {
        $tournament = Tournament::with('rewards.team')->findOrFail($tournamentId);

        return response()->json(['rewards' => $tournament->rewards]);
    }
}
