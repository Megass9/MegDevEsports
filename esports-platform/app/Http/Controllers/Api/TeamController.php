<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Team\CreateTeamRequest;
use App\Http\Requests\Team\UpdateTeamRequest;
use App\Models\Team;
use App\Services\Contracts\FileUploadServiceInterface;
use App\Services\Contracts\TeamServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeamController extends Controller
{
    public function __construct(
        private readonly TeamServiceInterface $teamService,
        private readonly FileUploadServiceInterface $fileUploadService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $teams = Team::with(['captain', 'members'])
            ->withCount('members')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($teams);
    }

    public function store(CreateTeamRequest $request): JsonResponse
    {
        $team = $this->teamService->create(
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'message' => 'Takım başarıyla oluşturuldu.',
            'team' => $team->load(['captain', 'members']),
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        $team = Team::with(['captain', 'members', 'matches' => function ($query) {
            $query->with(['team1', 'team2', 'winner'])->orderBy('created_at', 'desc')->limit(10);
        }, 'ranking.season'])->findOrFail($id);

        return response()->json(['team' => $team]);
    }

    public function update(UpdateTeamRequest $request, int $teamId): JsonResponse
    {
        $team = $this->teamService->update($teamId, $request->validated());

        return response()->json([
            'message' => 'Takım başarıyla güncellendi.',
            'team' => $team,
        ]);
    }

    public function destroy(int $teamId): JsonResponse
    {
        $this->teamService->delete($teamId);

        return response()->json([
            'message' => 'Takım başarıyla silindi.',
        ]);
    }

    public function uploadLogo(Request $request, int $teamId): JsonResponse
    {
        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $filename = $this->fileUploadService->uploadTeamLogo(
            $request->file('logo'),
            $teamId
        );

        $team = $this->teamService->updateLogo($teamId, $filename);

        return response()->json([
            'message' => 'Takım logosu başarıyla yüklendi.',
            'logo_url' => $team->logo_url,
        ]);
    }

    public function invite(Request $request, int $teamId): JsonResponse
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $this->teamService->invitePlayer(
            $teamId,
            $request->input('user_id'),
            $request->user()
        );

        return response()->json([
            'message' => 'Davet başarıyla gönderildi.',
        ]);
    }

    public function acceptInvitation(int $invitationId): JsonResponse
    {
        $this->teamService->acceptInvitation($invitationId);

        return response()->json([
            'message' => 'Davet kabul edildi.',
        ]);
    }

    public function declineInvitation(int $invitationId): JsonResponse
    {
        $this->teamService->declineInvitation($invitationId);

        return response()->json([
            'message' => 'Davet reddedildi.',
        ]);
    }

    public function joinByCode(Request $request): JsonResponse
    {
        $request->validate(['code' => 'required|string|size:8']);

        $team = $this->teamService->joinByCode($request->input('code'), $request->user());

        return response()->json([
            'message' => 'Takıma başarıyla katıldınız.',
            'team' => $team,
        ]);
    }

    public function leave(int $teamId, Request $request): JsonResponse
    {
        $this->teamService->leaveTeam($teamId, $request->user());

        return response()->json([
            'message' => 'Takımdan ayrıldınız.',
        ]);
    }

    public function kickMember(int $teamId, int $userId): JsonResponse
    {
        $this->teamService->kickMember($teamId, $userId);

        return response()->json([
            'message' => 'Oyuncu takımdan çıkarıldı.',
        ]);
    }

    public function transferCaptaincy(Request $request, int $teamId): JsonResponse
    {
        $request->validate(['user_id' => 'required|exists:users,id']);

        $team = $this->teamService->transferCaptaincy($teamId, $request->input('user_id'));

        return response()->json([
            'message' => 'Kaptanlık devredildi.',
            'team' => $team,
        ]);
    }

    public function myTeams(Request $request): JsonResponse
    {
        $teamsAsCaptain = $request->user()->teams()->with(['captain', 'members'])->get();
        $teamsAsMember = $request->user()->teamMemberships()->with(['captain', 'members'])->get();

        return response()->json([
            'captained_teams' => $teamsAsCaptain,
            'member_teams' => $teamsAsMember,
        ]);
    }

    public function invitations(Request $request): JsonResponse
    {
        $invitations = \App\Models\TeamInvitation::where('user_id', $request->user()->id)
            ->where('status', 'pending')
            ->with(['team', 'inviter'])
            ->get();

        return response()->json(['invitations' => $invitations]);
    }

    public function search(Request $request): JsonResponse
    {
        $request->validate(['term' => 'required|string|min:2']);

        $teams = Team::where('name', 'like', '%'.$request->input('term').'%')
            ->orWhere('code', 'like', '%'.$request->input('term').'%')
            ->with(['captain', 'members'])
            ->limit(20)
            ->get();

        return response()->json(['teams' => $teams]);
    }
}
