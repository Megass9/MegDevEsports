<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportTicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tickets = SupportTicket::where('user_id', $request->user()->id)
            ->with('replier')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'priority' => 'nullable|string|in:low,normal,high',
        ]);

        $ticket = SupportTicket::create([
            'user_id' => $request->user()->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'priority' => $validated['priority'] ?? 'normal',
            'status' => 'open',
        ]);

        return response()->json($ticket, 201);
    }

    public function show(int $id, Request $request): JsonResponse
    {
        $ticket = SupportTicket::where('user_id', $request->user()->id)
            ->with('replier')
            ->findOrFail($id);

        return response()->json($ticket);
    }

    public function reply(int $id, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_reply' => 'required|string|max:5000',
        ]);

        $ticket = SupportTicket::where('user_id', $request->user()->id)
            ->where('status', 'open')
            ->findOrFail($id);

        $ticket->update([
            'user_reply' => $validated['user_reply'],
            'user_replied_at' => now(),
        ]);

        return response()->json($ticket);
    }
}
