<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class NewChatMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public function __construct(
        public ChatMessage $message
    ) {}

    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->message->chat_room_id) {
            $channels[] = new Channel('chat.room.'.$this->message->chat_room_id);
        }

        return $channels;
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'user' => [
                'id' => $this->message->user->id,
                'name' => $this->message->user->name,
                'avatar' => $this->message->user->avatar_url,
            ],
            'message' => $this->message->message,
            'attachment' => $this->message->attachment,
            'chat_room_id' => $this->message->chat_room_id,
            'is_pinned' => $this->message->is_pinned,
            'created_at' => $this->message->created_at,
        ];
    }
}
