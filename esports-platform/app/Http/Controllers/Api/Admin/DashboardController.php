<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MatchModel;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use App\Services\Contracts\AdminLogServiceInterface;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(
        private readonly AdminLogServiceInterface $adminLogService
    ) {}

    public function index(): JsonResponse
    {
        $totalUsers = User::count();
        $totalTeams = Team::count();
        $activeTournaments = Tournament::whereIn('status', ['registration', 'in_progress'])->count();
        $completedTournaments = Tournament::where('status', 'completed')->count();
        $totalMatches = MatchModel::count();
        $pendingMatches = MatchModel::where('status', 'awaiting_confirmation')->count();
        $bannedUsers = User::where('is_banned', true)->count();

        $recentUsers = User::orderBy('created_at', 'desc')->limit(10)->get();
        $recentTournaments = Tournament::withCount('participants')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_teams' => $totalTeams,
                'active_tournaments' => $activeTournaments,
                'completed_tournaments' => $completedTournaments,
                'total_matches' => $totalMatches,
                'pending_matches' => $pendingMatches,
                'banned_users' => $bannedUsers,
            ],
            'recent_users' => $recentUsers,
            'recent_tournaments' => $recentTournaments,
        ]);
    }
}
