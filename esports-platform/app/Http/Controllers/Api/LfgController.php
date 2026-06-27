<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LfgPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class LfgController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = LfgPost::with('user')->where('is_active', true);

        if ($request->has('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->has('game')) {
            $query->where('game', $request->input('game'));
        }

        if ($request->has('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->has('rank')) {
            $query->where('rank', $request->input('rank'));
        }

        $posts = $query->latest()->paginate(20);

        return response()->json($posts);
    }

    public function myPosts(Request $request): JsonResponse
    {
        $posts = LfgPost::with('user')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['posts' => $posts]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:looking_team,looking_player',
            'game' => 'required|string|max:50',
            'role' => 'nullable|string|max:50',
            'rank' => 'nullable|string|max:50',
            'description' => 'required|string|max:500',
            'contact_info' => 'nullable|string|max:200',
        ]);

        $existingActive = LfgPost::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->count();

        if ($existingActive >= 3) {
            throw ValidationException::withMessages(['limit' => 'En fazla 3 aktif ilan açabilirsiniz.']);
        }

        $post = LfgPost::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'İlan yayınlandı.',
            'post' => $post->load('user'),
        ], 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $post = LfgPost::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();

        $validated = $request->validate([
            'type' => 'sometimes|in:looking_team,looking_player',
            'game' => 'sometimes|string|max:50',
            'role' => 'nullable|string|max:50',
            'rank' => 'nullable|string|max:50',
            'description' => 'sometimes|string|max:500',
            'contact_info' => 'nullable|string|max:200',
        ]);

        $post->update($validated);

        return response()->json([
            'message' => 'İlan güncellendi.',
            'post' => $post->fresh()->load('user'),
        ]);
    }

    public function toggleActive(Request $request, int $id): JsonResponse
    {
        $post = LfgPost::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        $post->update(['is_active' => !$post->is_active]);

        return response()->json([
            'message' => $post->is_active ? 'İlan yayına alındı.' : 'İlan kapatıldı.',
            'post' => $post->fresh(),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $post = LfgPost::where('id', $id)->where('user_id', $request->user()->id)->firstOrFail();
        $post->delete();

        return response()->json(['message' => 'İlan silindi.']);
    }

    public function filters(): JsonResponse
    {
        return response()->json([
            'roles' => ['Duelist', 'Initiator', 'Controller', 'Sentinel', 'Flex', 'Captain', 'Coach'],
            'ranks' => ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant', 'Unranked'],
            'games' => ['valorant', 'lol', 'cs2', 'dota2'],
        ]);
    }
}
