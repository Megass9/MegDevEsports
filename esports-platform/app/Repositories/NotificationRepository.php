<?php

namespace App\Repositories;

use App\Models\Notification;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class NotificationRepository implements NotificationRepositoryInterface
{
    public function findById(int $id): ?Notification
    {
        return Notification::find($id);
    }

    public function create(array $data): Notification
    {
        return Notification::create($data);
    }

    public function markAsRead(int $id): bool
    {
        return Notification::where('id', $id)->update([
            'is_read' => true,
            'read_at' => now(),
        ]) > 0;
    }

    public function markAllAsRead(int $userId): bool
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]) > 0;
    }

    public function getByUser(int $userId, int $limit = 20): Collection
    {
        return Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }

    public function getUnreadByUser(int $userId): Collection
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    public function countUnread(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();
    }

    public function delete(int $id): bool
    {
        return Notification::destroy($id) > 0;
    }

    public function deleteAllForUser(int $userId): bool
    {
        return Notification::where('user_id', $userId)->delete() > 0;
    }
}
