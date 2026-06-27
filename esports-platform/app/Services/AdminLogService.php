<?php

namespace App\Services;

use App\Models\AdminLog;
use App\Models\User;
use App\Services\Contracts\AdminLogServiceInterface;

class AdminLogService implements AdminLogServiceInterface
{
    public function log(User $admin, string $action, string $entityType, ?int $entityId, string $description, ?array $metadata = null): void
    {
        AdminLog::create([
            'admin_id' => $admin->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => $metadata,
        ]);
    }

    public function getLogs(int $perPage = 20)
    {
        return AdminLog::with('admin')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getLogsByAdmin(int $adminId, int $perPage = 20)
    {
        return AdminLog::with('admin')
            ->where('admin_id', $adminId)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }
}
