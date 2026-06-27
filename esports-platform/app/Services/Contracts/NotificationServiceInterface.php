<?php

namespace App\Services\Contracts;

use App\Enums\NotificationType;
use App\Models\User;

interface NotificationServiceInterface
{
    public function send(User $user, NotificationType $type, string $title, string $message, ?array $data = null): void;
    public function sendToMany(array $users, NotificationType $type, string $title, string $message, ?array $data = null): void;
    public function sendToAll(NotificationType $type, string $title, string $message, ?array $data = null): void;
    public function markAsRead(int $notificationId, User $user): void;
    public function markAllAsRead(User $user): void;
}
