<?php

namespace App\Services\Contracts;

use App\Models\User;

interface AdminLogServiceInterface
{
    public function log(User $admin, string $action, string $entityType, ?int $entityId, string $description, ?array $metadata = null): void;
    public function getLogs(int $perPage = 20);
    public function getLogsByAdmin(int $adminId, int $perPage = 20);
}
