<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MatchModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MatchLiveController extends Controller
{
    public function stream(int $matchId): StreamedResponse
    {
        $match = MatchModel::findOrFail($matchId);

        $lastUpdate = Cache::get("match_{$matchId}_updated", now()->timestamp);

        return response()->stream(function () use ($matchId, $lastUpdate) {
            set_time_limit(0);
            $sent = false;

            while (true) {
                if (connection_aborted()) break;

                $currentUpdate = Cache::get("match_{$matchId}_updated", $lastUpdate);

                if ($currentUpdate !== $lastUpdate || !$sent) {
                    $match = MatchModel::with(['team1', 'team2', 'winner'])->find($matchId);

                    if ($match) {
                        echo "event: score_update\n";
                        echo "data: " . json_encode([
                            'match_id' => $match->id,
                            'team1_score' => $match->team1_score,
                            'team2_score' => $match->team2_score,
                            'winner_id' => $match->winner_id,
                            'status' => $match->status->value,
                            'team1' => $match->team1 ? ['id' => $match->team1->id, 'name' => $match->team1->name] : null,
                            'team2' => $match->team2 ? ['id' => $match->team2->id, 'name' => $match->team2->name] : null,
                            'winner' => $match->winner ? ['id' => $match->winner->id, 'name' => $match->winner->name] : null,
                        ]) . "\n\n";
                    }

                    $lastUpdate = $currentUpdate;
                    $sent = true;
                }

                echo "event: heartbeat\n";
                echo "data: " . json_encode(['time' => now()->timestamp]) . "\n\n";

                ob_flush();
                flush();

                sleep(3);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
