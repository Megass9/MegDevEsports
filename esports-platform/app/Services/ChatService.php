<?php

namespace App\Services;

use App\Enums\ChatType;
use App\Events\NewChatMessage;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\User;
use App\Repositories\Contracts\ChatRepositoryInterface;
use App\Services\Contracts\ChatServiceInterface;
use Illuminate\Validation\ValidationException;

class ChatService implements ChatServiceInterface
{
    public function __construct(
        private readonly ChatRepositoryInterface $chatRepository
    ) {}

    public function createRoom(int $tournamentId, string $name): ChatRoom
    {
        return ChatRoom::create([
            'tournament_id' => $tournamentId,
            'name' => $name,
            'type' => 'tournament',
        ]);
    }

    public function createTeamRoom(int $teamId, string $name): ChatRoom
    {
        return ChatRoom::create([
            'team_id' => $teamId,
            'name' => $name,
            'type' => 'team',
        ]);
    }

    public function getTeamRoom(int $teamId): ?ChatRoom
    {
        return ChatRoom::where('team_id', $teamId)->where('type', 'team')->first();
    }

    public function sendMessage(int $chatRoomId, string $message, User $user, ?int $teamId = null, ?string $attachment = null): ChatMessage
    {
        $room = ChatRoom::findOrFail($chatRoomId);

        $chatMessage = $this->chatRepository->create([
            'user_id' => $user->id,
            'team_id' => $teamId,
            'chat_room_id' => $chatRoomId,
            'type' => ChatType::Team,
            'message' => $message,
            'attachment' => $attachment,
        ]);

        broadcast(new NewChatMessage($chatMessage))->toOthers();

        return $chatMessage->load('user');
    }

    public function getMessages(int $chatRoomId, int $limit = 50): array
    {
        $messages = ChatMessage::with('user')
            ->where('chat_room_id', $chatRoomId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse()
            ->values()
            ->toArray();

        $pinned = ChatMessage::with('user')
            ->where('chat_room_id', $chatRoomId)
            ->where('is_pinned', true)
            ->get()
            ->toArray();

        return [
            'messages' => $messages,
            'pinned' => $pinned,
        ];
    }

    public function getRoomsForUser(User $user): array
    {
        if ($user->isAdmin()) {
            $rooms = ChatRoom::with('tournament')
                ->where('is_active', true)
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $teamIds = $user->teamMemberships->pluck('id')->merge($user->teams->pluck('id'))->unique();

            $rooms = ChatRoom::with('tournament')
                ->where('is_active', true)
                ->whereHas('tournament.participants', function ($q) use ($teamIds) {
                    $q->whereIn('team_id', $teamIds);
                })
                ->orWhereHas('tournament', function ($q) use ($teamIds) {
                    $q->whereIn('id', function ($sub) use ($teamIds) {
                        $sub->select('tournament_id')
                            ->from('tournament_participants')
                            ->whereIn('team_id', $teamIds);
                    });
                })
                ->orderBy('created_at', 'desc')
                ->get();
        }

        return $rooms->toArray();
    }

    public function sendGlobal(string $message, User $user): ChatMessage
    {
        $chatMessage = ChatMessage::create([
            'user_id' => $user->id,
            'type' => ChatType::Admin,
            'message' => $message,
            'is_pinned' => true,
        ]);

        broadcast(new NewChatMessage($chatMessage->load('user')))->toOthers();

        return $chatMessage->load('user');
    }

    public function pinMessage(int $messageId, User $user): ChatMessage
    {
        if (!$user->isAdmin()) {
            throw ValidationException::withMessages(['message' => 'Bu işlem için admin yetkisi gerekli.']);
        }

        $message = $this->chatRepository->findById($messageId);
        if (!$message) {
            throw ValidationException::withMessages(['message' => 'Mesaj bulunamadı.']);
        }

        $message->update(['is_pinned' => !$message->is_pinned, 'pinned_by' => $user->id]);
        return $message->fresh()->load('user');
    }

    public function deleteMessage(int $messageId): bool
    {
        return $this->chatRepository->delete($messageId);
    }
}
