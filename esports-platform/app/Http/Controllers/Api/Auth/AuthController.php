<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Services\Contracts\AuthServiceInterface;
use App\Services\Contracts\AdminLogServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthServiceInterface $authService,
        private readonly AdminLogServiceInterface $adminLogService
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->authService->register($request->validated());

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Kayıt başarıyla tamamlandı.',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->login(
            $request->input('email'),
            $request->input('password')
        );

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['E-posta veya şifre hatalı.'],
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Giriş başarılı.',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'message' => 'Başarıyla çıkış yapıldı.',
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $this->authService->sendPasswordResetLink($request->input('email'));

        return response()->json([
            'message' => 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $reset = $this->authService->resetPassword(
            $request->input('email'),
            $request->input('token'),
            $request->input('password')
        );

        if (!$reset) {
            return response()->json([
                'message' => 'Şifre sıfırlama başarısız oldu. Geçersiz token.',
            ], 400);
        }

        return response()->json([
            'message' => 'Şifreniz başarıyla sıfırlandı.',
        ]);
    }

    public function verifyEmail(int $userId): JsonResponse
    {
        $verified = $this->authService->verifyEmail($userId);

        if (!$verified) {
            return response()->json([
                'message' => 'E-posta doğrulama başarısız.',
            ], 400);
        }

        return response()->json([
            'message' => 'E-posta başarıyla doğrulandı.',
        ]);
    }
}
