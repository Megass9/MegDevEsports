<?php

namespace App\Repositories\Contracts;

use App\Models\Tournament;
use Illuminate\Database\Eloquent\Collection;

interface TournamentRepositoryInterface
{
    public function findById(int $id): ?Tournament;
    public function create(array $data): Tournament;
    public function update(int $id, array $data): Tournament;
    public function delete(int $id): bool;
    public function all(): Collection;
    public function paginate(int $perPage = 15);
    public function getActive(): Collection;
    public function getCompleted(): Collection;
    public function getUpcoming(): Collection;
    public function getByGame(string $game): Collection;
    public function count(): int;
    public function countActive(): int;
}
