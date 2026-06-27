<?php

namespace App\Services;

use App\Services\Contracts\FileUploadServiceInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class FileUploadService implements FileUploadServiceInterface
{
    private const ALLOWED_TYPES = ['jpg', 'jpeg', 'png', 'webp'];
    private const MAX_FILE_SIZE = 5242880; // 5MB

    public function uploadAvatar(UploadedFile $file, int $userId): string
    {
        $this->validateFile($file);

        $filename = "avatar_{$userId}_".Str::random(10).'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('avatars', $filename, 'public');

        if (!$path) {
            throw ValidationException::withMessages(['file' => 'Dosya yüklenemedi.']);
        }

        return $filename;
    }

    public function uploadTeamLogo(UploadedFile $file, int $teamId): string
    {
        $this->validateFile($file);

        $filename = "logo_{$teamId}_".Str::random(10).'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('team-logos', $filename, 'public');

        if (!$path) {
            throw ValidationException::withMessages(['file' => 'Dosya yüklenemedi.']);
        }

        return $filename;
    }

    public function uploadMatchScreenshot(UploadedFile $file, int $matchId): string
    {
        $this->validateFile($file);

        $filename = "screenshot_{$matchId}_".Str::random(10).'.'.$file->getClientOriginalExtension();
        $path = $file->storeAs('match-screenshots', $filename, 'public');

        if (!$path) {
            throw ValidationException::withMessages(['file' => 'Dosya yüklenemedi.']);
        }

        return $filename;
    }

    public function deleteFile(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        return false;
    }

    public function validateFile(UploadedFile $file): bool
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if (!in_array($extension, self::ALLOWED_TYPES)) {
            throw ValidationException::withMessages([
                'file' => 'Geçersiz dosya formatı. Sadece jpg, jpeg, png, webp formatları desteklenir.',
            ]);
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw ValidationException::withMessages([
                'file' => 'Dosya boyutu 5MB\'dan küçük olmalıdır.',
            ]);
        }

        return true;
    }
}
