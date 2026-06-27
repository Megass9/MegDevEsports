<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ChatType;
use App\Enums\NotificationType;
use App\Http\Controllers\Controller;
use App\Services\Contracts\AdminLogServiceInterface;
use App\Services\Contracts\ChatServiceInterface;
use App\Services\Contracts\NotificationServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function __construct(
        private readonly ChatServiceInterface $chatService,
        private readonly NotificationServiceInterface $notificationService,
        private readonly AdminLogServiceInterface $adminLogService
    ) {}

    public function sendAnnouncement(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:1000',
            'pin' => 'boolean',
        ]);

        $message = $this->chatService->sendGlobal(
            $request->input('message'),
            $request->user()
        );

        if ($request->boolean('pin')) {
            $message->update(['is_pinned' => true, 'pinned_by' => $request->user()->id]);
        }

        $this->adminLogService->log(
            $request->user(),
            'send_announcement',
            'announcement',
            $message->id,
            "Duyuru yayınlandı: {$request->input('message')}"
        );

        return response()->json([
            'message' => 'Duyuru yayınlandı.',
            'data' => $message,
        ]);
    }

    public function getAnnouncements(): JsonResponse
    {
        $announcements = \App\Models\ChatMessage::with('user')
            ->where('type', ChatType::Admin)
            ->where('is_pinned', true)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json(['announcements' => $announcements]);
    }

    public function sendSystemNotification(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
        ]);

        $this->notificationService->sendToAll(
            NotificationType::SystemAnnouncement,
            $request->input('title'),
            $request->input('message')
        );

        $this->adminLogService->log(
            $request->user(),
            'send_system_notification',
            'notification',
            null,
            "Sistem bildirimi gönderildi: {$request->input('title')}"
        );

        return response()->json([
            'message' => 'Sistem bildirimi tüm kullanıcılara gönderildi.',
        ]);
    }
}
