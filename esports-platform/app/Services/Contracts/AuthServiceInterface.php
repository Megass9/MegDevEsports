<?php

namespace App\Services\Contracts;

use App\Models\User;

interface AuthServiceInterface
{
    public function register(array $data): User;
    public function login(string $email, string $password): ?User;
    public function logout(User $user): void;
    public function sendPasswordResetLink(string $email): void;
    public function resetPassword(string $email, string $token, string $password): bool;
    public function verifyEmail(int $userId): bool;
}
