<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\Contracts\FileUploadServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function __construct(
        private readonly FileUploadServiceInterface $fileUploadService
    ) {}

    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $user->update($request->validated());

        return response()->json([
            'message' => 'Profil başarıyla güncellendi.',
            'user' => new UserResource($user->fresh()),
        ]);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ]);

        $filename = $this->fileUploadService->uploadAvatar(
            $request->file('avatar'),
            $request->user()->id
        );

        $user = $request->user();
        $user->update(['avatar' => $filename]);

        return response()->json([
            'message' => 'Profil resmi başarıyla yüklendi.',
            'avatar_url' => $user->fresh()->avatar_url,
        ]);
    }

    public function addRiotId(Request $request): JsonResponse
    {
        $request->validate([
            'riot_id' => ['required', 'string', 'max:100', 'unique:users,riot_id,'.$request->user()->id],
        ]);

        $request->user()->update(['riot_id' => $request->input('riot_id')]);

        return response()->json([
            'message' => 'Riot ID başarıyla eklendi.',
        ]);
    }

    public function updateLocale(Request $request): JsonResponse
    {
        $request->validate([
            'locale' => ['required', 'string', 'in:tr,en'],
        ]);

        $request->user()->update(['locale' => $request->input('locale')]);

        return response()->json(['message' => 'Dil tercihi kaydedildi.']);
    }

    public function notifications(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $request->user()
                ->notifications()
                ->where('is_read', false)
                ->count(),
        ]);
    }
}
