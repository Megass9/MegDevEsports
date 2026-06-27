<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ranking;
use App\Models\Season;
use App\Services\Contracts\RankingServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RankingController extends Controller
{
    public function __construct(
        private readonly RankingServiceInterface $rankingService
    ) {}

    public function global(): JsonResponse
    {
        $rankings = Ranking::with('team.captain')
            ->whereHas('season', function ($query) {
                $query->where('is_active', true);
            })
            ->orderBy('points', 'desc')
            ->orderBy('win_rate', 'desc')
            ->orderBy('wins', 'desc')
            ->paginate(20);

        return response()->json($rankings);
    }

    public function bySeason(int $seasonId): JsonResponse
    {
        $rankings = $this->rankingService->getBySeason($seasonId);

        return response()->json($rankings);
    }

    public function seasons(): JsonResponse
    {
        $seasons = Season::orderBy('start_date', 'desc')->get();

        return response()->json(['seasons' => $seasons]);
    }

    public function currentSeason(): JsonResponse
    {
        $season = Season::where('is_active', true)->first();

        return response()->json(['season' => $season]);
    }

    public function team(int $teamId): JsonResponse
    {
        $ranking = $this->rankingService->getTeamRanking($teamId);

        return response()->json(['ranking' => $ranking]);
    }
}
