<?php

namespace App\Repositories\Contracts;

use App\Models\ChatMessage;
use Illuminate\Database\Eloquent\Collection;

interface ChatRepositoryInterface
{
    public function findById(int $id): ?ChatMessage;
    public function create(array $data): ChatMessage;
    public function delete(int $id): bool;
    public function getGlobal(int $limit = 50): Collection;
    public function getTeam(int $teamId, int $limit = 50): Collection;
    public function getAdmin(int $limit = 50): Collection;
    public function getByUser(int $userId): Collection;
    public function deleteByUser(int $userId): bool;
}
