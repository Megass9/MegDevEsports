<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Services\Contracts\AdminLogServiceInterface;
use App\Services\Contracts\TeamServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamManagementController extends Controller
{
    public function __construct(
        private readonly TeamServiceInterface $teamService,
        private readonly AdminLogServiceInterface $adminLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Team::with('captain')->withCount('members');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('code', 'like', "%{$search}%");
            });
        }

        $teams = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($teams);
    }

    public function show(int $id): JsonResponse
    {
        $team = Team::with(['captain', 'members', 'matches' => function ($query) {
            $query->with(['team1', 'team2', 'winner'])->orderBy('created_at', 'desc')->limit(20);
        }])->withCount('members')->findOrFail($id);

        return response()->json(['team' => $team]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $team = Team::findOrFail($id);
        $teamName = $team->name;

        $this->teamService->delete($id);

        $this->adminLogService->log(
            $request->user(),
            'delete_team',
            'team',
            $id,
            "{$teamName} takımı silindi."
        );

        return response()->json([
            'message' => 'Takım silindi.',
        ]);
    }
}
