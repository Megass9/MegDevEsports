<?php

namespace App\Repositories;

use App\Enums\ChatType;
use App\Models\ChatMessage;
use App\Repositories\Contracts\ChatRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class ChatRepository implements ChatRepositoryInterface
{
    public function findById(int $id): ?ChatMessage
    {
        return ChatMessage::with('user')->find($id);
    }

    public function create(array $data): ChatMessage
    {
        return ChatMessage::create($data);
    }

    public function delete(int $id): bool
    {
        return ChatMessage::destroy($id) > 0;
    }

    public function getGlobal(int $limit = 50): Collection
    {
        return ChatMessage::where('type', ChatType::Global->value)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse();
    }

    public function getTeam(int $teamId, int $limit = 50): Collection
    {
        return ChatMessage::where('type', ChatType::Team->value)
            ->where('team_id', $teamId)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse();
    }

    public function getAdmin(int $limit = 50): Collection
    {
        return ChatMessage::where('type', ChatType::Admin->value)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->reverse();
    }

    public function getByUser(int $userId): Collection
    {
        return ChatMessage::where('user_id', $userId)->get();
    }

    public function deleteByUser(int $userId): bool
    {
        return ChatMessage::where('user_id', $userId)->delete() > 0;
    }
}
