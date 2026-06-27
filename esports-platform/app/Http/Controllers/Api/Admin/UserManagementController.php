<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Contracts\AdminLogServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
    public function __construct(
        private readonly AdminLogServiceInterface $adminLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('riot_id', 'like', "%{$search}%");
            });
        }

        if ($request->has('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->has('banned')) {
            $query->where('is_banned', $request->boolean('banned'));
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($users);
    }

    public function show(int $id): JsonResponse
    {
        $user = User::with(['teams.captain', 'teamMemberships.captain'])->findOrFail($id);

        return response()->json(['user' => $user]);
    }

    public function ban(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        $user = User::findOrFail($id);
        $user->update(['is_banned' => true, 'banned_at' => now()]);

        $this->adminLogService->log(
            $request->user(),
            'ban_user',
            'user',
            $id,
            "{$user->name} kullanıcısı banlandı. Sebep: {$request->input('reason')}",
            ['reason' => $request->input('reason')]
        );

        return response()->json([
            'message' => 'Kullanıcı banlandı.',
        ]);
    }

    public function unban(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update(['is_banned' => false, 'banned_at' => null]);

        $this->adminLogService->log(
            $request->user(),
            'unban_user',
            'user',
            $id,
            "{$user->name} kullanıcısının banı kaldırıldı."
        );

        return response()->json([
            'message' => 'Kullanıcının banı kaldırıldı.',
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $id,
            'riot_id' => 'nullable|string|max:100',
        ]);

        $user = User::findOrFail($id);
        $user->update($validated);

        $this->adminLogService->log(
            $request->user(),
            'update_user',
            'user',
            $id,
            "{$user->name} kullanıcısı güncellendi."
        );

        return response()->json([
            'message' => 'Kullanıcı güncellendi.',
            'user' => $user->fresh(),
        ]);
    }

    public function changeRole(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'role' => 'required|string|in:player,team_captain,admin',
        ]);

        $user = User::findOrFail($id);
        $user->update(['role' => $validated['role']]);

        $this->adminLogService->log(
            $request->user(),
            'change_role',
            'user',
            $id,
            "{$user->name} kullanıcısının rolü {$validated['role']} olarak değiştirildi."
        );

        return response()->json([
            'message' => 'Kullanıcı rolü değiştirildi.',
            'user' => $user->fresh(),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        $this->adminLogService->log(
            $request->user(),
            'delete_user',
            'user',
            $id,
            "{$user->name} kullanıcısı silindi."
        );

        $user->delete();

        return response()->json([
            'message' => 'Kullanıcı silindi.',
        ]);
    }
}
