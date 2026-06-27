<?php

namespace App\Providers;

use App\Repositories\ChatRepository;
use App\Repositories\Contracts\ChatRepositoryInterface;
use App\Repositories\Contracts\MatchRepositoryInterface;
use App\Repositories\Contracts\NotificationRepositoryInterface;
use App\Repositories\Contracts\RankingRepositoryInterface;
use App\Repositories\Contracts\TeamRepositoryInterface;
use App\Repositories\Contracts\TournamentRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\MatchRepository;
use App\Repositories\NotificationRepository;
use App\Repositories\RankingRepository;
use App\Repositories\TeamRepository;
use App\Repositories\TournamentRepository;
use App\Repositories\UserRepository;
use App\Services\AdminLogService;
use App\Services\AuthService;
use App\Services\BracketService;
use App\Services\ChatService;
use App\Services\Contracts\AdminLogServiceInterface;
use App\Services\Contracts\AuthServiceInterface;
use App\Services\Contracts\BracketServiceInterface;
use App\Services\Contracts\ChatServiceInterface;
use App\Services\Contracts\FileUploadServiceInterface;
use App\Services\Contracts\MatchServiceInterface;
use App\Services\Contracts\NotificationServiceInterface;
use App\Services\Contracts\RankingServiceInterface;
use App\Services\Contracts\TeamServiceInterface;
use App\Services\Contracts\TournamentServiceInterface;
use App\Services\FileUploadService;
use App\Services\MatchService;
use App\Services\NotificationService;
use App\Services\RankingService;
use App\Services\TeamService;
use App\Services\TournamentService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(TeamRepositoryInterface::class, TeamRepository::class);
        $this->app->bind(TournamentRepositoryInterface::class, TournamentRepository::class);
        $this->app->bind(MatchRepositoryInterface::class, MatchRepository::class);
        $this->app->bind(ChatRepositoryInterface::class, ChatRepository::class);
        $this->app->bind(NotificationRepositoryInterface::class, NotificationRepository::class);
        $this->app->bind(RankingRepositoryInterface::class, RankingRepository::class);

        $this->app->bind(AuthServiceInterface::class, AuthService::class);
        $this->app->bind(TeamServiceInterface::class, TeamService::class);
        $this->app->bind(TournamentServiceInterface::class, TournamentService::class);
        $this->app->bind(BracketServiceInterface::class, BracketService::class);
        $this->app->bind(MatchServiceInterface::class, MatchService::class);
        $this->app->bind(ChatServiceInterface::class, ChatService::class);
        $this->app->bind(NotificationServiceInterface::class, NotificationService::class);
        $this->app->bind(RankingServiceInterface::class, RankingService::class);
        $this->app->bind(FileUploadServiceInterface::class, FileUploadService::class);
        $this->app->bind(AdminLogServiceInterface::class, AdminLogService::class);
    }

    public function boot(): void
    {
        //
    }
}
