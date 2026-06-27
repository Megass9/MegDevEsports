<?php

namespace App\Repositories;

use App\Models\Team;
use App\Repositories\Contracts\TeamRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class TeamRepository implements TeamRepositoryInterface
{
    public function findById(int $id): ?Team
    {
        return Team::with(['captain', 'members'])->find($id);
    }

    public function findByCode(string $code): ?Team
    {
        return Team::where('code', $code)->first();
    }

    public function create(array $data): Team
    {
        return Team::create($data);
    }

    public function update(int $id, array $data): Team
    {
        $team = $this->findById($id);
        $team->update($data);
        return $team->fresh();
    }

    public function delete(int $id): bool
    {
        return Team::destroy($id) > 0;
    }

    public function all(): Collection
    {
        return Team::with('captain')->get();
    }

    public function paginate(int $perPage = 15)
    {
        return Team::with('captain')
            ->withCount('members')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function search(string $term): Collection
    {
        return Team::where('name', 'like', "%{$term}%")
            ->orWhere('code', 'like', "%{$term}%")
            ->with('captain')
            ->get();
    }

    public function getByCaptain(int $userId): Collection
    {
        return Team::where('captain_id', $userId)->get();
    }

    public function getByMember(int $userId): Collection
    {
        return Team::whereHas('members', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->with('captain')->get();
    }

    public function count(): int
    {
        return Team::count();
    }

    public function getRanked(int $perPage = 20)
    {
        return Team::where('is_active', true)
            ->with('captain')
            ->withCount('members')
            ->orderBy('points', 'desc')
            ->orderBy('win_rate', 'desc')
            ->paginate($perPage);
    }
}
