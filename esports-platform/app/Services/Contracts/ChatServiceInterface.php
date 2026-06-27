<?php

namespace App\Services\Contracts;

use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\User;

interface ChatServiceInterface
{
    public function createRoom(int $tournamentId, string $name): ChatRoom;
    public function createTeamRoom(int $teamId, string $name): ChatRoom;
    public function getTeamRoom(int $teamId): ?ChatRoom;
    public function sendMessage(int $chatRoomId, string $message, User $user, ?int $teamId = null, ?string $attachment = null): ChatMessage;
    public function getMessages(int $chatRoomId, int $limit = 50): array;
    public function getRoomsForUser(User $user): array;
    public function pinMessage(int $messageId, User $user): ChatMessage;
    public function deleteMessage(int $messageId): bool;
    public function sendGlobal(string $message, User $user): ChatMessage;
}
