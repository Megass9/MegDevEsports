<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportTicketManagementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SupportTicket::with('user')->orderBy('created_at', 'desc');

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->paginate(20));
    }

    public function show(int $id): JsonResponse
    {
        $ticket = SupportTicket::with(['user', 'replier'])->findOrFail($id);
        return response()->json($ticket);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'admin_reply' => 'required|string|max:5000',
        ]);

        $ticket = SupportTicket::findOrFail($id);
        $ticket->update([
            'admin_reply' => $validated['admin_reply'],
            'replied_by' => $request->user()->id,
            'replied_at' => now(),
        ]);

        return response()->json($ticket);
    }

    public function close(int $id): JsonResponse
    {
        $ticket = SupportTicket::findOrFail($id);
        $ticket->update(['status' => 'closed']);
        return response()->json($ticket);
    }
}
