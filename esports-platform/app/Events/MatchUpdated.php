<?php

namespace App\Events;

use App\Models\MatchModel;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class MatchUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public MatchModel $match
    ) {}

    public function broadcastOn(): array
    {
        return [
            new Channel('tournament.'.$this->match->tournament_id),
        ];
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->match->id,
            'tournament_id' => $this->match->tournament_id,
            'round' => $this->match->round,
            'match_number' => $this->match->match_number,
            'team1' => $this->match->team1?->name,
            'team2' => $this->match->team2?->name,
            'winner_id' => $this->match->winner_id,
            'status' => $this->match->status->value,
            'scores' => [
                'team1' => $this->match->team1_score,
                'team2' => $this->match->team2_score,
            ],
        ];
    }
}
