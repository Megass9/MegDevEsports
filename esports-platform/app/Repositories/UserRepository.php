<?php

namespace App\Repositories;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class UserRepository implements UserRepositoryInterface
{
    public function findById(int $id): ?User
    {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function update(int $id, array $data): User
    {
        $user = $this->findById($id);
        $user->update($data);
        return $user->fresh();
    }

    public function delete(int $id): bool
    {
        return User::destroy($id) > 0;
    }

    public function all(): Collection
    {
        return User::all();
    }

    public function paginate(int $perPage = 15)
    {
        return User::orderBy('created_at', 'desc')->paginate($perPage);
    }

    public function findByIds(array $ids): Collection
    {
        return User::whereIn('id', $ids)->get();
    }

    public function count(): int
    {
        return User::count();
    }
}
