<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Contracts\FileUploadServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FileController extends Controller
{
    public function __construct(
        private readonly FileUploadServiceInterface $fileUploadService
    ) {}

    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'type' => ['required', 'string', 'in:avatar,team_logo,match_screenshot'],
        ]);

        $file = $request->file('file');
        $type = $request->input('type');

        $path = match ($type) {
            'avatar' => $this->fileUploadService->uploadAvatar($file, $request->user()->id),
            'team_logo' => $this->fileUploadService->uploadTeamLogo($file, $request->input('entity_id', 0)),
            'match_screenshot' => $this->fileUploadService->uploadMatchScreenshot($file, $request->input('entity_id', 0)),
            default => throw new \InvalidArgumentException('Geçersiz dosya türü.'),
        };

        return response()->json([
            'message' => 'Dosya başarıyla yüklendi.',
            'path' => $path,
            'url' => asset('storage/'.$path),
        ]);
    }
}
