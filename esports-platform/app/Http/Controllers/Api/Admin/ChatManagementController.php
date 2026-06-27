<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Services\Contracts\AdminLogServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatManagementController extends Controller
{
    public function __construct(
        private readonly AdminLogServiceInterface $adminLogService
    ) {}

    public function globalMessages(): JsonResponse
    {
        $messages = ChatMessage::where('type', 'global')
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($messages);
    }

    public function teamMessages(Request $request): JsonResponse
    {
        $messages = ChatMessage::where('type', 'team')
            ->with(['user', 'team'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($messages);
    }

    public function deleteMessage(Request $request, int $id): JsonResponse
    {
        $message = ChatMessage::findOrFail($id);

        $this->adminLogService->log(
            $request->user(),
            'delete_chat_message',
            'chat_message',
            $id,
            "Sohbet mesajı silindi. (Gönderen: {$message->user?->name})"
        );

        $message->delete();

        return response()->json([
            'message' => 'Mesaj silindi.',
        ]);
    }

    public function pinMessage(Request $request, int $id): JsonResponse
    {
        $message = ChatMessage::findOrFail($id);
        $message->update([
            'is_pinned' => !$message->is_pinned,
            'pinned_by' => $request->user()->id,
        ]);

        $action = $message->is_pinned ? 'sabitlendi' : 'sabiti kaldırıldı';

        $this->adminLogService->log(
            $request->user(),
            'pin_chat_message',
            'chat_message',
            $id,
            "Sohbet mesajı {$action}."
        );

        return response()->json([
            'message' => "Mesaj {$action}.",
        ]);
    }
}
