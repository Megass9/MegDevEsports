<?php

namespace App\Http\Controllers\Api;

use App\Enums\TournamentStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tournament\CreateTournamentRequest;
use App\Models\Tournament;
use App\Models\Team;
use App\Services\Contracts\BracketServiceInterface;
use App\Services\Contracts\TournamentServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TournamentController extends Controller
{
    public function __construct(
        private readonly TournamentServiceInterface $tournamentService,
        private readonly BracketServiceInterface $bracketService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = Tournament::withCount('participants');

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('game')) {
            $query->where('game', $request->input('game'));
        }

        $tournaments = $query->orderBy('start_date', 'desc')->paginate(15);

        return response()->json($tournaments);
    }

    public function active(): JsonResponse
    {
        $tournaments = Tournament::withCount('participants')
            ->whereIn('status', [
                TournamentStatus::Registration->value,
                TournamentStatus::InProgress->value,
            ])
            ->orderBy('start_date', 'asc')
            ->get();

        return response()->json(['tournaments' => $tournaments]);
    }

    public function show(int $id): JsonResponse
    {
        $tournament = Tournament::with([
            'participants.captain',
            'participants' => function ($query) {
                $query->withCount('members');
            },
            'winner',
            'matches' => function ($query) {
                $query->with(['team1', 'team2', 'winner', 'results'])->orderBy('round')->orderBy('match_number');
            },
            'rewards.team',
            'chatRooms',
        ])->findOrFail($id);

        $bracket = $this->bracketService->getBracket($tournament);

        return response()->json([
            'tournament' => $tournament,
            'bracket' => $bracket,
        ]);
    }

    public function store(CreateTournamentRequest $request): JsonResponse
    {
        $tournament = $this->tournamentService->create($request->validated());

        return response()->json([
            'message' => 'Turnuva başarıyla oluşturuldu.',
            'tournament' => $tournament,
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $tournament = $this->tournamentService->update($id, $request->all());

        return response()->json([
            'message' => 'Turnuva başarıyla güncellendi.',
            'tournament' => $tournament,
        ]);
    }

    public function registerTeam(Request $request, int $tournamentId): JsonResponse
    {
        $request->validate(['team_id' => 'required|exists:teams,id']);

        $this->tournamentService->registerTeam($tournamentId, $request->input('team_id'));

        return response()->json([
            'message' => 'Turnuvaya başarıyla kayıt olundu.',
        ]);
    }

    public function unregisterTeam(Request $request, int $tournamentId): JsonResponse
    {
        $request->validate(['team_id' => 'required|exists:teams,id']);

        $this->tournamentService->unregisterTeam($tournamentId, $request->input('team_id'));

        return response()->json([
            'message' => 'Turnuva kaydı iptal edildi.',
        ]);
    }

    public function pendingCheckIn(): JsonResponse
    {
        $user = request()->user();

        $teamIds = Team::where('captain_id', $user->id)->pluck('id');

        if ($teamIds->isEmpty()) {
            return response()->json(['tournaments' => []]);
        }

        $tournaments = Tournament::whereIn('status', [TournamentStatus::Registration->value, TournamentStatus::Pending->value])
            ->whereHas('participants', function ($q) use ($teamIds) {
                $q->whereIn('team_id', $teamIds)
                    ->whereNull('checked_in_at')
                    ->where('disqualified', false);
            })
            ->with(['participants' => function ($q) use ($teamIds) {
                $q->whereIn('team_id', $teamIds);
            }])
            ->withCount('participants')
            ->get();

        return response()->json(['tournaments' => $tournaments]);
    }

    public function checkIn(Request $request, int $tournamentId): JsonResponse
    {
        $request->validate(['team_id' => 'required|exists:teams,id']);

        $this->tournamentService->checkIn($tournamentId, $request->input('team_id'));

        return response()->json([
            'message' => 'Check-in başarıyla yapıldı.',
        ]);
    }

    public function start(int $id): JsonResponse
    {
        $tournament = $this->tournamentService->start($id);

        return response()->json([
            'message' => 'Turnuva başlatıldı.',
            'tournament' => $tournament,
        ]);
    }

    public function bracket(int $id): JsonResponse
    {
        $tournament = Tournament::findOrFail($id);
        $bracket = $this->bracketService->getBracket($tournament);

        return response()->json(['bracket' => $bracket]);
    }

    public function history(): JsonResponse
    {
        $tournaments = Tournament::where('status', TournamentStatus::Completed->value)
            ->with('winner')
            ->withCount('participants')
            ->orderBy('completed_at', 'desc')
            ->paginate(20);

        return response()->json($tournaments);
    }
}
