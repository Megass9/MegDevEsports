<?php

namespace App\Repositories\Contracts;

use App\Models\Team;
use Illuminate\Database\Eloquent\Collection;

interface TeamRepositoryInterface
{
    public function findById(int $id): ?Team;
    public function findByCode(string $code): ?Team;
    public function create(array $data): Team;
    public function update(int $id, array $data): Team;
    public function delete(int $id): bool;
    public function all(): Collection;
    public function paginate(int $perPage = 15);
    public function search(string $term): Collection;
    public function getByCaptain(int $userId): Collection;
    public function getByMember(int $userId): Collection;
    public function count(): int;
    public function getRanked(int $perPage = 20);
}
