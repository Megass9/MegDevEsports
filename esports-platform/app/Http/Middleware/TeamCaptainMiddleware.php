<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TeamCaptainMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $teamId = $request->route('teamId') ?? $request->input('team_id');
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Giriş yapmalısınız.'], 401);
        }

        if ($user->isAdmin()) {
            return $next($request);
        }

        if ($teamId) {
            $team = \App\Models\Team::find($teamId);
            if (!$team || !$team->isCaptain($user)) {
                return response()->json([
                    'message' => 'Bu işlem için takım kaptanı yetkisi gereklidir.',
                ], 403);
            }
        }

        return $next($request);
    }
}
