<?php

namespace App\Services;

use App\Enums\NotificationType;
use App\Events\NotificationCreated;
use App\Models\Notification;
use App\Models\User;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Services\Contracts\NotificationServiceInterface;

class NotificationService implements NotificationServiceInterface
{
    public function __construct(
        private readonly NotificationRepositoryInterface $notificationRepository
    ) {}

    public function send(User $user, NotificationType $type, string $title, string $message, ?array $data = null): void
    {
        $notification = $this->notificationRepository->create([
            'user_id' => $user->id,
            'type' => $type->value,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);

        broadcast(new NotificationCreated($notification))->toOthers();
    }

    public function sendToMany(array $users, NotificationType $type, string $title, string $message, ?array $data = null): void
    {
        foreach ($users as $user) {
            $this->send($user, $type, $title, $message, $data);
        }
    }

    public function sendToAll(NotificationType $type, string $title, string $message, ?array $data = null): void
    {
        $users = User::all();
        $this->sendToMany($users->all(), $type, $title, $message, $data);
    }

    public function markAsRead(int $notificationId, User $user): void
    {
        $notification = $this->notificationRepository->findById($notificationId);
        if ($notification && $notification->user_id === $user->id) {
            $this->notificationRepository->markAsRead($notificationId);
        }
    }

    public function markAllAsRead(User $user): void
    {
        $this->notificationRepository->markAllAsRead($user->id);
    }
}
