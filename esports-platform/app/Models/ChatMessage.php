<?php

namespace App\Models;

use App\Enums\ChatType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'team_id',
        'chat_room_id',
        'type',
        'message',
        'attachment',
        'attachment_type',
        'is_pinned',
        'pinned_by',
    ];

    protected function casts(): array
    {
        return [
            'type' => ChatType::class,
            'is_pinned' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class);
    }

    public function scopeGlobal($query)
    {
        return $query->where('type', ChatType::Global);
    }

    public function scopeByRoom($query, int $chatRoomId)
    {
        return $query->where('chat_room_id', $chatRoomId);
    }

    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }
}
