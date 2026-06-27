<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Contracts\NotificationServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        private readonly NotificationServiceInterface $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $unreadCount = $request->user()
            ->notifications()
            ->where('is_read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    public function markAsRead(int $id, Request $request): JsonResponse
    {
        $this->notificationService->markAsRead($id, $request->user());

        return response()->json([
            'message' => 'Bildirim okundu olarak işaretlendi.',
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->notificationService->markAllAsRead($request->user());

        return response()->json([
            'message' => 'Tüm bildirimler okundu olarak işaretlendi.',
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()
            ->notifications()
            ->where('is_read', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function destroy(int $id): JsonResponse
    {
        $notification = \App\Models\Notification::findOrFail($id);
        $notification->delete();

        return response()->json([
            'message' => 'Bildirim silindi.',
        ]);
    }
}
