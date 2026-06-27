<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ChatRoom;
use App\Services\Contracts\ChatServiceInterface;
use App\Services\Contracts\FileUploadServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    public function __construct(
        private readonly ChatServiceInterface $chatService,
        private readonly FileUploadServiceInterface $fileUploadService
    ) {}

    public function rooms(Request $request): JsonResponse
    {
        $rooms = $this->chatService->getRoomsForUser($request->user());

        return response()->json(['rooms' => $rooms]);
    }

    public function teamRoom(int $teamId, Request $request): JsonResponse
    {
        $user = $request->user();

        $isCaptain = $user->teams()->where('id', $teamId)->exists();
        $isMember = $user->teamMemberships()->where('team_id', $teamId)->exists();

        if (!$isCaptain && !$isMember && !$user->isAdmin()) {
            return response()->json(['message' => 'Bu takımın sohbetine erişim izniniz yok.'], 403);
        }

        $room = $this->chatService->getTeamRoom($teamId);
        if (!$room) {
            $team = \App\Models\Team::findOrFail($teamId);
            $room = $this->chatService->createTeamRoom($teamId, $team->name . ' Sohbet');
        }

        return response()->json(['room' => $room]);
    }

    public function messages(int $roomId, Request $request): JsonResponse
    {
        $room = ChatRoom::findOrFail($roomId);
        $user = $request->user();

        if (!$user->isAdmin()) {
            if ($room->type === 'team' && $room->team_id) {
                $isCaptain = $user->teams()->where('id', $room->team_id)->exists();
                $isMember = $user->teamMemberships()->where('team_id', $room->team_id)->exists();
                if (!$isCaptain && !$isMember) {
                    return response()->json(['message' => 'Bu sohbete erişim izniniz yok.'], 403);
                }
            } else {
                $teamIds = $user->teamMemberships->pluck('id')->merge($user->teams->pluck('id'))->unique();
                $isParticipant = $room->tournament->participants()->whereIn('team_id', $teamIds)->exists();
                if (!$isParticipant) {
                    return response()->json(['message' => 'Bu sohbete erişim izniniz yok.'], 403);
                }
            }
        }

        $data = $this->chatService->getMessages($roomId);

        return response()->json($data);
    }

    public function send(Request $request, int $roomId): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'attachment' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $room = ChatRoom::findOrFail($roomId);
        $user = $request->user();

        if (!$user->isAdmin()) {
            if ($room->type === 'team' && $room->team_id) {
                $isCaptain = $user->teams()->where('id', $room->team_id)->exists();
                $isMember = $user->teamMemberships()->where('team_id', $room->team_id)->exists();
                if (!$isCaptain && !$isMember) {
                    return response()->json(['message' => 'Bu sohbete mesaj gönderme izniniz yok.'], 403);
                }
            } else {
                $teamIds = $user->teamMemberships->pluck('id')->merge($user->teams->pluck('id'))->unique();
                $isParticipant = $room->tournament->participants()->whereIn('team_id', $teamIds)->exists();
                if (!$isParticipant) {
                    return response()->json(['message' => 'Bu sohbete mesaj gönderme izniniz yok.'], 403);
                }
            }
        }

        $attachment = null;
        if ($request->hasFile('attachment')) {
            $attachment = $this->fileUploadService->uploadMatchScreenshot(
                $request->file('attachment'),
                $roomId
            );
        }

        $teamId = null;
        if (!$user->isAdmin()) {
            $team = $user->teams->first() ?? $user->teamMemberships->first();
            $teamId = $team?->id;
        }

        $message = $this->chatService->sendMessage(
            $roomId,
            $request->input('message'),
            $user,
            $teamId,
            $attachment
        );

        return response()->json([
            'message' => 'Mesaj gönderildi.',
            'data' => $message,
        ], 201);
    }

    public function pin(int $messageId, Request $request): JsonResponse
    {
        $message = $this->chatService->pinMessage($messageId, $request->user());

        return response()->json([
            'message' => $message->is_pinned ? 'Mesaj sabitlendi.' : 'Mesaj sabiti kaldırıldı.',
        ]);
    }

    public function destroy(int $messageId): JsonResponse
    {
        $this->chatService->deleteMessage($messageId);

        return response()->json([
            'message' => 'Mesaj silindi.',
        ]);
    }
}
