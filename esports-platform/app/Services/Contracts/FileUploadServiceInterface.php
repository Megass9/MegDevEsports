<?php

namespace App\Services\Contracts;

use Illuminate\Http\UploadedFile;

interface FileUploadServiceInterface
{
    public function uploadAvatar(UploadedFile $file, int $userId): string;
    public function uploadTeamLogo(UploadedFile $file, int $teamId): string;
    public function uploadMatchScreenshot(UploadedFile $file, int $matchId): string;
    public function deleteFile(string $path): bool;
    public function validateFile(UploadedFile $file): bool;
}
