<?php

namespace App\Services;

use App\Models\MatchResult;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;

class OcrService
{
    private string $scriptPath;

    public function __construct()
    {
        $this->scriptPath = base_path('scripts/ocr_reader.py');
    }

    public function analyzeScreenshot(MatchResult $result): array
    {
        $screenshot = $result->screenshot;
        if (!$screenshot) {
            return ['team1_score' => null, 'team2_score' => null, 'confidence' => 0, 'error' => 'No screenshot'];
        }

        $fullPath = Storage::disk('public')->path($screenshot);
        if (!file_exists($fullPath)) {
            return ['team1_score' => null, 'team2_score' => null, 'confidence' => 0, 'error' => 'File not found'];
        }

        try {
            $pythonPath = 'python';
            $command = sprintf(
                '%s %s %s 2>&1',
                escapeshellcmd($pythonPath),
                escapeshellarg($this->scriptPath),
                escapeshellarg($fullPath)
            );

            $output = shell_exec($command);

            if ($output === null) {
                return ['team1_score' => null, 'team2_score' => null, 'confidence' => 0, 'error' => 'Process failed'];
            }

            $data = json_decode($output, true);
            if (!$data || isset($data['error'])) {
                return [
                    'team1_score' => null,
                    'team2_score' => null,
                    'confidence' => 0,
                    'error' => $data['error'] ?? 'Invalid output',
                ];
            }

            $this->saveOcrResult($result, $data);

            return $data;
        } catch (\Throwable $e) {
            Log::error('OCR analysis failed', [
                'match_result_id' => $result->id,
                'error' => $e->getMessage(),
            ]);
            return ['team1_score' => null, 'team2_score' => null, 'confidence' => 0, 'error' => $e->getMessage()];
        }
    }

    private function saveOcrResult(MatchResult $result, array $data): void
    {
        $ocrTeam1 = $data['team1_score'] ?? null;
        $ocrTeam2 = $data['team2_score'] ?? null;
        $confidence = $data['confidence'] ?? 0;

        $status = 'pending';
        if ($ocrTeam1 !== null && $ocrTeam2 !== null) {
            $submittedScore = $result->score;
            $submittedTeamId = $result->team_id;
            $match = $result->match;

            $expectedScore = null;
            if ($match->team1_id === $submittedTeamId) {
                $expectedScore = $ocrTeam1;
            } elseif ($match->team2_id === $submittedTeamId) {
                $expectedScore = $ocrTeam2;
            }

            if ($expectedScore !== null && $expectedScore === $submittedScore) {
                $status = 'matched';
            } elseif ($expectedScore !== null) {
                $status = 'mismatched';
            }
        }

        $result->update([
            'ocr_team1_score' => $ocrTeam1,
            'ocr_team2_score' => $ocrTeam2,
            'ocr_confidence' => $confidence,
            'ocr_status' => $status,
        ]);
    }
}
