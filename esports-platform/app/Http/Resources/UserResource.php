<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role->value,
            'role_label' => $this->role->label(),
            'avatar' => $this->avatar,
            'avatar_url' => $this->avatar_url,
            'riot_id' => $this->riot_id,
            'is_banned' => $this->is_banned,
            'email_verified' => !is_null($this->email_verified_at),
            'last_active_at' => $this->last_active_at,
            'created_at' => $this->created_at,

        ];
    }
}
