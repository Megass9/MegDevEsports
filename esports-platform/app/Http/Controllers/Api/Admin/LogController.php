<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminLog;
use App\Services\Contracts\AdminLogServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogController extends Controller
{
    public function __construct(
        private readonly AdminLogServiceInterface $adminLogService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = AdminLog::with('admin')->orderBy('created_at', 'desc');

        if ($request->has('action')) {
            $query->where('action', $request->input('action'));
        }

        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->input('entity_type'));
        }

        if ($request->has('admin_id')) {
            $query->where('admin_id', $request->input('admin_id'));
        }

        $logs = $query->paginate(30);

        return response()->json($logs);
    }
}
