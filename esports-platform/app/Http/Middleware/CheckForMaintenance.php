<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class CheckForMaintenance
{
    public function handle(Request $request, Closure $next): Response
    {
        if (Setting::getValue('maintenance_mode', false)) {
            $user = null;

            if ($bearer = $request->bearerToken()) {
                $accessToken = PersonalAccessToken::findToken($bearer);
                $user = $accessToken?->tokenable;
            }

            if (!$user) {
                $user = $request->user('sanctum');
            }

            if ($user && $user->role === UserRole::Admin) {
                return $next($request);
            }

            if ($request->is('api/maintenance*') || $request->is('api/login') || $request->is('api/register') || $request->is('api/home/stats')) {
                return $next($request);
            }

            return response()->json([
                'message' => 'Bakım modu',
                'maintenance' => true,
            ], 503);
        }

        return $next($request);
    }
}
