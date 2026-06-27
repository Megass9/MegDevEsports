<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::all()->groupBy('group')->map(function ($items) {
            return $items->mapWithKeys(fn ($item) => [$item->key => $item->value]);
        });

        return response()->json(['settings' => $settings]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'settings' => 'required|array',
            'settings.*' => 'required|string',
        ]);

        foreach ($validated['settings'] as $key => $value) {
            Setting::setValue($key, $value);
        }

        return response()->json(['message' => 'Ayarlar güncellendi.']);
    }

    public function getGames(): JsonResponse
    {
        $games = Setting::getValue('available_games', ['valorant']);
        return response()->json(['games' => $games]);
    }

    public function addGame(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'game' => 'required|string|min:2|max:50',
        ]);

        $games = Setting::getValue('available_games', ['valorant']);
        if (!in_array($validated['game'], $games)) {
            $games[] = $validated['game'];
            Setting::setValue('available_games', $games);
        }

        return response()->json(['message' => 'Oyun eklendi.', 'games' => $games]);
    }

    public function removeGame(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'game' => 'required|string',
        ]);

        $games = Setting::getValue('available_games', ['valorant']);
        $games = array_values(array_filter($games, fn ($g) => $g !== $validated['game']));
        Setting::setValue('available_games', $games);

        return response()->json(['message' => 'Oyun kaldırıldı.', 'games' => $games]);
    }
}
