<?php

namespace App\Services;

use App\Enums\MatchStatus;
use App\Models\MatchModel;
use App\Models\Tournament;
use App\Services\Contracts\BracketServiceInterface;
use Illuminate\Support\Facades\DB;

class BracketService implements BracketServiceInterface
{
    public function generateFromTeams(Tournament $tournament, $teams): array
    {
        $teamCount = $teams->count();
        $totalSlots = pow(2, ceil(log($teamCount, 2)));
        $rounds = log($totalSlots, 2);

        $teams = $teams->shuffle();
        $bracket = [];
        $matchNumber = 1;

        DB::transaction(function () use ($tournament, $teams, $totalSlots, $rounds, &$bracket, &$matchNumber) {
            $firstRoundMatches = [];

            for ($i = 0; $i < $totalSlots / 2; $i++) {
                $team1 = $teams->get($i * 2);
                $team2 = $teams->get(($i * 2) + 1);

                $match = MatchModel::create([
                    'tournament_id' => $tournament->id,
                    'round' => 1,
                    'match_number' => $matchNumber,
                    'team1_id' => $team1?->id,
                    'team2_id' => $team2?->id,
                    'status' => MatchStatus::Scheduled,
                    'scheduled_at' => $tournament->start_date,
                ]);

                $firstRoundMatches[] = [
                    'match_id' => $match->id,
                    'round' => 1,
                    'match_number' => $matchNumber,
                    'team1' => $team1 ? ['id' => $team1->id, 'name' => $team1->name] : null,
                    'team2' => $team2 ? ['id' => $team2->id, 'name' => $team2->name] : null,
                    'winner' => null,
                ];

                $matchNumber++;
            }

            $bracket['rounds'][] = [
                'round' => 1,
                'matches' => $firstRoundMatches,
            ];

            for ($round = 2; $round <= $rounds; $round++) {
                $matchesInRound = $totalSlots / pow(2, $round);
                $roundMatches = [];

                for ($m = 0; $m < $matchesInRound; $m++) {
                    $match = MatchModel::create([
                        'tournament_id' => $tournament->id,
                        'round' => $round,
                        'match_number' => $matchNumber,
                        'team1_id' => null,
                        'team2_id' => null,
                        'status' => MatchStatus::Scheduled,
                        'scheduled_at' => $tournament->start_date->addHours(($round - 1) * 2),
                    ]);

                    $roundMatches[] = [
                        'match_id' => $match->id,
                        'round' => $round,
                        'match_number' => $matchNumber,
                        'team1' => null,
                        'team2' => null,
                        'winner' => null,
                    ];

                    $matchNumber++;
                }

                $bracket['rounds'][] = [
                    'round' => $round,
                    'matches' => $roundMatches,
                ];
            }
        });

        return $bracket;
    }

    public function generate(Tournament $tournament): array
    {
        $participants = $tournament->participants()->get();
        $teamCount = $participants->count();
        $totalSlots = pow(2, ceil(log($teamCount, 2)));
        $rounds = log($totalSlots, 2);

        $teams = $participants->shuffle();
        $bracket = [];
        $matchNumber = 1;

        DB::transaction(function () use ($tournament, $teams, $totalSlots, $rounds, &$bracket, &$matchNumber) {
            $firstRoundMatches = [];

            for ($i = 0; $i < $totalSlots / 2; $i++) {
                $team1 = $teams->get($i * 2);
                $team2 = $teams->get(($i * 2) + 1);

                $match = MatchModel::create([
                    'tournament_id' => $tournament->id,
                    'round' => 1,
                    'match_number' => $matchNumber,
                    'team1_id' => $team1?->id,
                    'team2_id' => $team2?->id,
                    'status' => MatchStatus::Scheduled,
                    'scheduled_at' => $tournament->start_date,
                ]);

                $firstRoundMatches[] = [
                    'match_id' => $match->id,
                    'round' => 1,
                    'match_number' => $matchNumber,
                    'team1' => $team1 ? ['id' => $team1->id, 'name' => $team1->name] : null,
                    'team2' => $team2 ? ['id' => $team2->id, 'name' => $team2->name] : null,
                    'winner' => null,
                ];

                $matchNumber++;
            }

            $bracket['rounds'][] = [
                'round' => 1,
                'matches' => $firstRoundMatches,
            ];

            for ($round = 2; $round <= $rounds; $round++) {
                $matchesInRound = $totalSlots / pow(2, $round);
                $roundMatches = [];

                for ($m = 0; $m < $matchesInRound; $m++) {
                    $match = MatchModel::create([
                        'tournament_id' => $tournament->id,
                        'round' => $round,
                        'match_number' => $matchNumber,
                        'team1_id' => null,
                        'team2_id' => null,
                        'status' => MatchStatus::Scheduled,
                        'scheduled_at' => $tournament->start_date->addHours(($round - 1) * 2),
                    ]);

                    $roundMatches[] = [
                        'match_id' => $match->id,
                        'round' => $round,
                        'match_number' => $matchNumber,
                        'team1' => null,
                        'team2' => null,
                        'winner' => null,
                    ];

                    $matchNumber++;
                }

                $bracket['rounds'][] = [
                    'round' => $round,
                    'matches' => $roundMatches,
                ];
            }
        });

        return $bracket;
    }

    public function getBracket(Tournament $tournament): array
    {
        $matches = MatchModel::where('tournament_id', $tournament->id)
            ->with(['team1', 'team2', 'winner'])
            ->orderBy('round')
            ->orderBy('match_number')
            ->get();

        $bracket = [];
        foreach ($matches->groupBy('round') as $round => $roundMatches) {
            $bracket['rounds'][] = [
                'round' => (int) $round,
                'matches' => $roundMatches->map(function ($match) {
                    return [
                        'match_id' => $match->id,
                        'round' => $match->round,
                        'match_number' => $match->match_number,
                        'team1' => $match->team1 ? ['id' => $match->team1->id, 'name' => $match->team1->name] : null,
                        'team2' => $match->team2 ? ['id' => $match->team2->id, 'name' => $match->team2->name] : null,
                        'winner' => $match->winner ? ['id' => $match->winner->id, 'name' => $match->winner->name] : null,
                        'status' => $match->status->value,
                        'scores' => [
                            'team1' => $match->team1_score,
                            'team2' => $match->team2_score,
                        ],
                    ];
                })->toArray(),
            ];
        }

        $bracket['total_rounds'] = isset($bracket['rounds']) ? count($bracket['rounds']) : 0;
        return $bracket;
    }

    public function advanceWinner(Tournament $tournament, int $matchId, int $winnerId): void
    {
        $currentMatch = MatchModel::findOrFail($matchId);
        $nextRound = $currentMatch->round + 1;
        $nextMatchNumber = ceil($currentMatch->match_number / 2);

        $nextMatch = MatchModel::where('tournament_id', $tournament->id)
            ->where('round', $nextRound)
            ->where('match_number', $nextMatchNumber)
            ->first();

        if (!$nextMatch) return;

        $teamColumn = $currentMatch->match_number % 2 === 1 ? 'team1_id' : 'team2_id';
        $nextMatch->update([$teamColumn => $winnerId]);
    }
}
