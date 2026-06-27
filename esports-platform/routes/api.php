<?php

use App\Http\Controllers\Api\Admin\AnnouncementController;
use App\Http\Controllers\Api\Admin\ChatManagementController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\LogController;
use App\Http\Controllers\Api\Admin\RewardManagementController;
use App\Http\Controllers\Api\Admin\SettingsController;
use App\Http\Controllers\Api\Admin\SupportTicketManagementController;
use App\Http\Controllers\Api\Admin\TeamManagementController;
use App\Http\Controllers\Api\Admin\TournamentManagementController;
use App\Http\Controllers\Api\Admin\UserManagementController;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\HomeController;
use App\Http\Controllers\Api\LfgController;
use App\Http\Controllers\Api\MatchController;
use App\Http\Controllers\Api\MatchLiveController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\RankingController;
use App\Http\Controllers\Api\SupportTicketController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\TournamentController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (No Auth Required)
|--------------------------------------------------------------------------
*/
Route::get('/maintenance', function () {
    $maintenance = \App\Models\Setting::getValue('maintenance_mode', false);
    return response()->json([
        'maintenance' => $maintenance,
    ]);
});

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::get('/verify-email/{userId}', [AuthController::class, 'verifyEmail']);

Route::get('/home/stats', [HomeController::class, 'stats']);

// All remaining routes are behind maintenance check
Route::middleware('maintenance')->group(function () {

// Public tournament & ranking data
Route::get('/tournaments/active', [TournamentController::class, 'active']);
Route::get('/tournaments/history', [TournamentController::class, 'history']);
Route::get('/tournaments/{id}', [TournamentController::class, 'show']);
Route::get('/tournaments/{id}/bracket', [TournamentController::class, 'bracket']);
Route::get('/tournaments', [TournamentController::class, 'index']);

Route::get('/rankings/global', [RankingController::class, 'global']);
Route::get('/rankings/seasons', [RankingController::class, 'seasons']);
Route::get('/rankings/current-season', [RankingController::class, 'currentSeason']);
Route::get('/rankings/team/{teamId}', [RankingController::class, 'team']);
Route::get('/rankings/season/{seasonId}', [RankingController::class, 'bySeason']);

Route::get('/announcements', [AnnouncementController::class, 'getAnnouncements']);

Route::get('/lfg', [LfgController::class, 'index']);
Route::get('/lfg/filters', [LfgController::class, 'filters']);

Route::get('/teams/search', [TeamController::class, 'search']);
Route::get('/teams/{id}', [TeamController::class, 'show']);
Route::get('/teams', [TeamController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Authenticated Routes (Sanctum)
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Dashboard
    Route::get('/dashboard', [HomeController::class, 'dashboard']);

    // LFG
    Route::prefix('lfg')->group(function () {
        Route::get('/my', [LfgController::class, 'myPosts']);
        Route::post('/', [LfgController::class, 'store']);
        Route::put('/{id}', [LfgController::class, 'update']);
        Route::post('/{id}/toggle', [LfgController::class, 'toggleActive']);
        Route::delete('/{id}', [LfgController::class, 'destroy']);
    });

    // Profile
    Route::prefix('profile')->group(function () {
        Route::get('/', [UserController::class, 'show']);
        Route::put('/', [UserController::class, 'update']);
        Route::post('/avatar', [UserController::class, 'uploadAvatar']);
        Route::post('/riot-id', [UserController::class, 'addRiotId']);
        Route::post('/locale', [UserController::class, 'updateLocale']);
        Route::get('/notifications', [UserController::class, 'notifications']);
    });

    // Support Tickets
    Route::prefix('support')->group(function () {
        Route::get('/', [SupportTicketController::class, 'index']);
        Route::post('/', [SupportTicketController::class, 'store']);
        Route::get('/{id}', [SupportTicketController::class, 'show']);
        Route::post('/{id}/reply', [SupportTicketController::class, 'reply']);
    });

    // Teams
    Route::prefix('teams')->group(function () {
        Route::post('/', [TeamController::class, 'store']);
        Route::put('/{teamId}', [TeamController::class, 'update']);
        Route::delete('/{teamId}', [TeamController::class, 'destroy']);
        Route::post('/{teamId}/logo', [TeamController::class, 'uploadLogo']);
        Route::post('/{teamId}/invite', [TeamController::class, 'invite']);
        Route::post('/{teamId}/kick/{userId}', [TeamController::class, 'kickMember']);
        Route::post('/{teamId}/leave', [TeamController::class, 'leave']);
        Route::post('/{teamId}/transfer-captaincy', [TeamController::class, 'transferCaptaincy']);
        Route::get('/my/list', [TeamController::class, 'myTeams']);
        Route::get('/my/invitations', [TeamController::class, 'invitations']);
        Route::post('/join', [TeamController::class, 'joinByCode']);
        Route::post('/invitations/{invitationId}/accept', [TeamController::class, 'acceptInvitation']);
        Route::post('/invitations/{invitationId}/decline', [TeamController::class, 'declineInvitation']);
    });

    // Tournament Registration
    Route::post('/tournaments/{tournamentId}/register', [TournamentController::class, 'registerTeam']);
    Route::post('/tournaments/{tournamentId}/unregister', [TournamentController::class, 'unregisterTeam']);
    Route::post('/tournaments/{tournamentId}/check-in', [TournamentController::class, 'checkIn']);
    Route::get('/tournaments/my/pending-checkin', [TournamentController::class, 'pendingCheckIn']);

    // Matches
    Route::prefix('matches')->group(function () {
        Route::get('/my', [MatchController::class, 'myMatches']);
        Route::get('/{id}', [MatchController::class, 'show']);
        Route::post('/{matchId}/result', [MatchController::class, 'submitResult']);
        Route::post('/{matchId}/confirm', [MatchController::class, 'confirm']);
        Route::post('/{matchId}/dispute', [MatchController::class, 'dispute']);
    });

    // Live match updates (SSE - public)
    Route::get('/matches/{matchId}/live', [MatchLiveController::class, 'stream']);

    // Chat (Tournament & Team based)
    Route::prefix('chat')->group(function () {
        Route::get('/rooms', [ChatController::class, 'rooms']);
        Route::get('/rooms/{roomId}/messages', [ChatController::class, 'messages']);
        Route::post('/rooms/{roomId}/send', [ChatController::class, 'send']);
        Route::get('/team/{teamId}', [ChatController::class, 'teamRoom']);
        Route::post('/{messageId}/pin', [ChatController::class, 'pin']);
        Route::delete('/{messageId}', [ChatController::class, 'destroy']);
    });

    // Notifications
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
    });

    // File Upload
    Route::post('/upload', [FileController::class, 'upload']);

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('admin')->middleware('admin')->group(function () {

        // Dashboard
        Route::get('/dashboard', [DashboardController::class, 'index']);

        // User Management
        Route::prefix('users')->group(function () {
            Route::get('/', [UserManagementController::class, 'index']);
            Route::get('/{id}', [UserManagementController::class, 'show']);
            Route::put('/{id}', [UserManagementController::class, 'update']);
            Route::post('/{id}/ban', [UserManagementController::class, 'ban']);
            Route::post('/{id}/unban', [UserManagementController::class, 'unban']);
            Route::post('/{id}/change-role', [UserManagementController::class, 'changeRole']);
            Route::delete('/{id}', [UserManagementController::class, 'destroy']);
        });

        // Team Management
        Route::prefix('teams')->group(function () {
            Route::get('/', [TeamManagementController::class, 'index']);
            Route::get('/{id}', [TeamManagementController::class, 'show']);
            Route::delete('/{id}', [TeamManagementController::class, 'destroy']);
        });

        // Tournament Management
        Route::prefix('tournaments')->group(function () {
            Route::get('/', [TournamentManagementController::class, 'index']);
            Route::post('/', [TournamentManagementController::class, 'store']);
            Route::put('/{id}', [TournamentManagementController::class, 'update']);
            Route::post('/{id}/cancel', [TournamentManagementController::class, 'cancel']);
            Route::post('/{id}/open-registration', [TournamentManagementController::class, 'openRegistration']);
            Route::post('/{id}/start', [TournamentManagementController::class, 'start']);
            Route::post('/{id}/complete', [TournamentManagementController::class, 'complete']);
            Route::get('/{id}/check-in-status', [TournamentManagementController::class, 'checkInStatus']);
            Route::post('/matches/{matchId}/confirm', [TournamentManagementController::class, 'confirmMatch']);
            Route::post('/matches/{matchId}/set-result', [TournamentManagementController::class, 'setMatchResult']);
            Route::post('/matches/{matchId}/resolve-dispute', [TournamentManagementController::class, 'resolveDispute']);
            Route::post('/ocr/{matchResultId}/accept', [TournamentManagementController::class, 'acceptOcr']);
            Route::post('/ocr/{matchResultId}/reject', [TournamentManagementController::class, 'rejectOcr']);
            Route::post('/ocr/{matchResultId}/reanalyze', [TournamentManagementController::class, 'reanalyzeOcr']);
        });

        // Chat Management
        Route::prefix('chat')->group(function () {
            Route::get('/global', [ChatManagementController::class, 'globalMessages']);
            Route::get('/team', [ChatManagementController::class, 'teamMessages']);
            Route::delete('/{id}', [ChatManagementController::class, 'deleteMessage']);
            Route::post('/{id}/pin', [ChatManagementController::class, 'pinMessage']);
        });

        // Announcements
        Route::post('/announcements', [AnnouncementController::class, 'sendAnnouncement']);
        Route::post('/system-notifications', [AnnouncementController::class, 'sendSystemNotification']);

        // Settings
        Route::prefix('settings')->group(function () {
            Route::get('/', [SettingsController::class, 'index']);
            Route::put('/', [SettingsController::class, 'update']);
            Route::get('/games', [SettingsController::class, 'getGames']);
            Route::post('/games', [SettingsController::class, 'addGame']);
            Route::delete('/games', [SettingsController::class, 'removeGame']);
        });

        // Rewards
        Route::prefix('rewards')->group(function () {
            Route::get('/', [RewardManagementController::class, 'index']);
            Route::post('/', [RewardManagementController::class, 'store']);
            Route::post('/{id}/approve', [RewardManagementController::class, 'approve']);
            Route::post('/{id}/deliver', [RewardManagementController::class, 'markDelivered']);
            Route::get('/tournament/{tournamentId}', [RewardManagementController::class, 'tournamentRewards']);
        });

        // Logs
        Route::get('/logs', [LogController::class, 'index']);

        // Support Tickets
        Route::prefix('support')->group(function () {
            Route::get('/', [SupportTicketManagementController::class, 'index']);
            Route::get('/{id}', [SupportTicketManagementController::class, 'show']);
            Route::post('/{id}/reply', [SupportTicketManagementController::class, 'reply']);
            Route::post('/{id}/close', [SupportTicketManagementController::class, 'close']);
        });
    });
});
});
