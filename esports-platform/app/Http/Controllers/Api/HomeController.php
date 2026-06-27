<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchModel;
use App\Models\Team;
use App\Models\Tournament;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function stats(): JsonResponse
    {
        return response()->json([
            'active_tournaments' => Tournament::whereIn('status', ['registration', 'in_progress'])->count(),
            'total_teams' => Team::count(),
            'completed_tournaments' => Tournament::where('status', 'completed')->count(),
            'total_users' => User::count(),
        ]);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        $captainedTeams = $user->teams()->withCount('members')->get();
        $memberTeams = $user->teamMemberships()->withCount('members')->get();
        $allTeams = $captainedTeams->merge($memberTeams);
        $captainedTeamIds = $captainedTeams->pluck('id');
        $myTeamIds = $allTeams->pluck('id');

        $upcomingMatches = MatchModel::whereIn('status', ['scheduled', 'ongoing', 'awaiting_confirmation'])
            ->where(function ($q) use ($myTeamIds) {
                $q->whereIn('team1_id', $myTeamIds)->orWhereIn('team2_id', $myTeamIds);
            })
            ->with(['team1', 'team2', 'tournament'])
            ->orderBy('scheduled_at')
            ->limit(10)
            ->get();

        $totalMatches = MatchModel::where(function ($q) use ($myTeamIds) {
            $q->whereIn('team1_id', $myTeamIds)->orWhereIn('team2_id', $myTeamIds);
        })->count();

        $wins = MatchModel::where('winner_id', $myTeamIds)->count();
        $losses = $totalMatches - $wins;

        $myTournaments = Tournament::whereHas('participants', function ($q) use ($myTeamIds) {
            $q->whereIn('team_id', $myTeamIds);
        })->withCount('participants')->get();

        return response()->json([
            'teams' => $allTeams,
            'captained_team_ids' => $captainedTeamIds,
            'upcoming_matches' => $upcomingMatches,
            'tournaments' => $myTournaments,
            'stats' => [
                'total_matches' => $totalMatches,
                'wins' => $wins,
                'losses' => $losses,
                'win_rate' => $totalMatches > 0 ? round(($wins / $totalMatches) * 100, 1) : 0,
                'total_teams' => $allTeams->count(),
                'total_tournaments' => $myTournaments->count(),
            ],
            'pending_checkins' => Tournament::whereIn('status', ['registration', 'pending'])
                ->whereHas('participants', function ($q) use ($captainedTeamIds) {
                    $q->whereIn('team_id', $captainedTeamIds)
                        ->whereNull('checked_in_at')
                        ->where('disqualified', false);
                })
                ->with(['participants' => function ($q) use ($captainedTeamIds) {
                    $q->whereIn('team_id', $captainedTeamIds);
                }])
                ->get(),
        ]);
    }
}
