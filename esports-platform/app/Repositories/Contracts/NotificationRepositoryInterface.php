<?php

namespace App\Repositories\Contracts;

use App\Models\Notification;
use Illuminate\Database\Eloquent\Collection;

interface NotificationRepositoryInterface
{
    public function findById(int $id): ?Notification;
    public function create(array $data): Notification;
    public function markAsRead(int $id): bool;
    public function markAllAsRead(int $userId): bool;
    public function getByUser(int $userId, int $limit = 20): Collection;
    public function getUnreadByUser(int $userId): Collection;
    public function countUnread(int $userId): int;
    public function delete(int $id): bool;
    public function deleteAllForUser(int $userId): bool;
}
