import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trophy, Users, Swords, TrendingUp, Calendar, Shield, ArrowRight,
  CheckCircle, Clock, Gamepad2, LogIn, Plus, Target, Zap,
  Medal, Star, Activity, User, Flag, Layers, BarChart3,
  ChevronRight, Sparkles, Flame, Mail
} from 'lucide-react';
import { homeService } from '../services/tournament';
import { useAuthStore } from '../store/authStore';
import { formatDate, getStatusColor, getStatusLabel } from '../utils/format';
import { useTranslation } from '../hooks/useTranslation';
import toast from 'react-hot-toast';

function StatCard({ icon: Icon, label, value, sub, color, progress }: {
  icon: any; label: string; value: string | number; sub?: string; color: string; progress?: number;
}) {
  return (
    <div className="card card-hover relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/5 to-transparent rounded-bl-full" />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color.replace('text', 'bg').replace('-400', '/15')}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        {progress !== undefined && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <TrendingUp className={`w-3 h-3 ${progress >= 50 ? 'text-green-400' : 'text-yellow-400'}`} />
            <span className={progress >= 50 ? 'text-green-400' : 'text-yellow-400'}>{progress}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-0.5 font-display">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
      {sub && <div className="text-[10px] text-gray-600 mt-0.5">{sub}</div>}
      {progress !== undefined && (
        <div className="mt-3 h-1 bg-surface-400 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${progress >= 50 ? 'bg-green-500' : progress >= 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  const colors: Record<string, string> = {
    scheduled: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    ongoing: 'bg-green-500/15 text-green-400 border-green-500/20 animate-pulse',
    awaiting_confirmation: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
    disputed: 'bg-red-500/15 text-red-400 border-red-500/20',
    completed: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    registration: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
    in_progress: 'bg-green-500/15 text-green-400 border-green-500/20',
  };
  const labels: Record<string, string> = {
    scheduled: t('matches.scheduled'),
    ongoing: t('matches.ongoing'),
    awaiting_confirmation: t('matches.awaitingConfirmation'),
    disputed: t('matches.disputed'),
    completed: t('matches.completed'),
    registration: t('tournaments.status.registration'),
    in_progress: t('tournaments.status.in_progress'),
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${colors[status] || 'bg-gray-500/15 text-gray-400 border-gray-500/20'}`}>
      {labels[status] || status}
    </span>
  );
}

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    homeService.dashboard()
      .then(setData)
      .catch(() => toast.error(t('common.error')))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="relative">
          <div className="animate-spin w-12 h-12 border-2 border-valorant border-t-transparent rounded-full" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="w-5 h-5 text-valorant animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const winRate = stats.win_rate || 0;

  const pendingCheckins = data?.pending_checkins || [];
  const upcomingMatches = data?.upcoming_matches || [];
  const teams = data?.teams || [];
  const tournaments = data?.tournaments || [];
  const captainedIds: number[] = data?.captained_team_ids || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-600 via-surface-500 to-surface-600 border border-surface-400/50 p-6 md:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-valorant/15 via-transparent to-transparent" />
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-valorant/5 rounded-full blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar_url}
                alt={user?.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-2 ring-valorant/30"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-surface-500 flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white">{user?.name}</h1>
                {user?.role === 'admin' && (
                  <span className="px-2 py-0.5 bg-valorant/15 text-valorant text-[10px] font-medium rounded-full border border-valorant/20">Admin</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </span>
                <span className="w-1 h-1 bg-gray-600 rounded-full" />
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {t('dashboard.participated')} {user?.created_at ? formatDate(user.created_at) : '-'}
                </span>
              </div>
            </div>
          </div>
          <div className="md:ml-auto flex items-center gap-3">
            <div className="text-right">
              <div className="text-3xl font-display font-bold text-white">{stats.total_matches || 0}</div>
              <div className="text-xs text-gray-500">{t('dashboard.totalMatches')}</div>
            </div>
            <div className="w-px h-10 bg-surface-400" />
            <div className="text-right">
              <div className="text-3xl font-display font-bold text-green-400">{stats.wins || 0}</div>
              <div className="text-xs text-gray-500">{t('dashboard.wins')}</div>
            </div>
            <div className="w-px h-10 bg-surface-400" />
            <div className="text-right">
              <div className="text-3xl font-display font-bold text-yellow-400">{winRate}%</div>
              <div className="text-xs text-gray-500">Win Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Swords} label={t('dashboard.totalMatches')} value={stats.total_matches || 0} sub={stats.wins ? `${stats.wins} ${t('dashboard.wins').toLowerCase()}` : undefined} color="text-blue-400" progress={winRate} />
        <StatCard icon={Trophy} label={t('dashboard.wins')} value={stats.wins || 0} sub={stats.losses ? `${stats.losses} ${t('dashboard.losses').toLowerCase()}` : undefined} color="text-green-400" progress={stats.total_matches > 0 ? Math.round((stats.wins / stats.total_matches) * 100) : 0} />
        <StatCard icon={Shield} label={t('dashboard.team')} value={stats.total_teams || 0} sub={captainedIds.length ? `${captainedIds.length} ${t('dashboard.captaincy')}` : undefined} color="text-purple-400" />
        <StatCard icon={Layers} label={t('dashboard.tournaments')} value={stats.total_tournaments || 0} sub={t('dashboard.participation')} color="text-orange-400" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card lg:col-span-1">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-valorant/10 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-valorant" />
            </div>
            <h2 className="section-title mb-0">{t('dashboard.quickActions')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(teams.length > 0 ? [
              { to: pendingCheckins.length > 0 ? `/tournaments/${pendingCheckins[0].id}` : '/tournaments', icon: Clock, label: t('dashboard.checkIn'), desc: `${pendingCheckins.length} ${t('dashboard.pending')}`, color: 'text-yellow-400' },
              { to: '/matches', icon: Swords, label: t('dashboard.myMatchesLink'), desc: t('dashboard.viewMatches'), color: 'text-green-400' },
              { to: '/my-teams', icon: Shield, label: t('dashboard.manageTeam'), desc: t('dashboard.editTeams'), color: 'text-purple-400' },
              { to: '/tournaments', icon: Trophy, label: t('dashboard.discover'), desc: t('dashboard.findTournament'), color: 'text-valorant' },
            ] : [
              { to: '/teams/create', icon: Plus, label: t('dashboard.createTeam'), desc: t('dashboard.createNewTeam'), color: 'text-valorant' },
              { to: '/tournaments', icon: Trophy, label: t('dashboard.discover'), desc: t('dashboard.browseTeams'), color: 'text-blue-400' },
              { to: '/ranking', icon: TrendingUp, label: t('dashboard.ranking'), desc: t('ranking.title'), color: 'text-green-400' },
              { to: '/teams', icon: Users, label: t('dashboard.team'), desc: t('dashboard.browseTeams'), color: 'text-yellow-400' },
            ]).map((item, i) => (
              <Link key={i} to={item.to} className="group flex flex-col gap-1.5 p-3.5 bg-surface-400 rounded-xl hover:bg-surface-300 transition-all hover:scale-[1.02]">
                <div className={`w-9 h-9 rounded-lg bg-surface-500 flex items-center justify-center group-hover:${item.color.replace('text', 'bg').replace('-400', '/15')} transition-colors`}>
                  <item.icon className={`w-4.5 h-4.5 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-white">{item.label}</span>
                <span className="text-[10px] text-gray-500">{item.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Check-ins */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <h2 className="section-title mb-0">{t('dashboard.pendingCheckIns')}</h2>
                <p className="text-[10px] text-gray-500">{t('dashboard.pendingCheckinDesc')}</p>
              </div>
            </div>
            {pendingCheckins.length > 0 && (
              <span className="px-2 py-0.5 bg-yellow-500/15 text-yellow-400 text-xs font-medium rounded-full">{pendingCheckins.length} {t('dashboard.items')}</span>
            )}
          </div>
          {pendingCheckins.length > 0 ? (
            <div className="space-y-2">
              {pendingCheckins.map((checkin: any) => (
                <Link key={checkin.id} to={`/tournaments/${checkin.id}`} className="group flex items-center gap-4 p-4 bg-surface-400 rounded-xl hover:bg-surface-300 transition-all border border-yellow-500/10 hover:border-yellow-500/20">
                  <div className="w-11 h-11 bg-yellow-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-yellow-400 transition-colors">{checkin.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{checkin.participants?.[0]?.name} {t('dashboard.participatingWith')}</p>
                  </div>
                  <span className="text-xs font-medium text-yellow-400 bg-yellow-500/10 px-3 py-1.5 rounded-lg group-hover:bg-yellow-500/20 transition-colors shrink-0">
                    {t('dashboard.checkIn')}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-3">
                <CheckCircle className="w-7 h-7 text-green-400" />
              </div>
              <p className="text-sm font-medium text-gray-400">{t('dashboard.allCheckinsDone')}</p>
              <p className="text-xs text-gray-600 mt-0.5">{t('dashboard.noPendingCheckins')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Matches */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Swords className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="section-title mb-0">{t('dashboard.upcoming')}</h2>
              <p className="text-[10px] text-gray-500">{t('dashboard.upcomingDesc')}</p>
            </div>
          </div>
          <Link to="/matches" className="btn-ghost text-xs flex items-center gap-1">
            Tümünü Gör <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {upcomingMatches.length > 0 ? (
          <div className="space-y-3">
            {upcomingMatches.map((m: any) => (
              <Link key={m.id} to={`/matches/${m.id}`} className="group flex items-center gap-4 p-4 bg-surface-400 rounded-xl hover:bg-surface-300 transition-all">
                <div className="hidden md:flex flex-col items-center min-w-[60px]">
                  <div className="text-xs font-bold text-gray-400 uppercase">{m.scheduled_at ? new Date(m.scheduled_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '-'}</div>
                  <div className="text-[10px] text-gray-600">{m.scheduled_at ? new Date(m.scheduled_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : ''}</div>
                </div>
                <div className="flex-1 flex items-center gap-3 md:gap-6">
                  <div className="flex-1 text-right">
                    <p className={`text-sm font-semibold ${m.team1_id ? 'text-white' : 'text-gray-600'}`}>{m.team1?.name || 'TBD'}</p>
                    <p className="text-[10px] text-gray-600">{m.team1?.game || ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-600 bg-surface-500 px-2 py-1 rounded">VS</span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${m.team2_id ? 'text-white' : 'text-gray-600'}`}>{m.team2?.name || 'TBD'}</p>
                    <p className="text-[10px] text-gray-600">{m.team2?.game || ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="hidden md:block text-xs text-gray-500 truncate max-w-[120px]">{m.tournament?.name}</div>
                  <StatusBadge status={m.status} />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        ) : tournaments.length > 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-3">
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-400">{t('dashboard.notStarted')}</p>
            <p className="text-xs text-gray-600 mt-1">{t('dashboard.notStartedDesc')}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-surface-400 rounded-2xl flex items-center justify-center mb-3">
              <Calendar className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-sm font-medium text-gray-400">{t('dashboard.noMatchesYet')}</p>
            <p className="text-xs text-gray-600 mt-1 mb-4">{t('dashboard.noMatchesDesc')}</p>
            <Link to="/tournaments" className="btn-primary text-xs px-4 py-2">{t('dashboard.discover')}</Link>
          </div>
        )}
      </div>

      {/* Teams & Tournaments */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Teams */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h2 className="section-title mb-0">{t('dashboard.myTeams')}</h2>
                <p className="text-[10px] text-gray-500">{teams.length} {t('dashboard.teamCount')}</p>
              </div>
            </div>
            <Link to="/my-teams" className="btn-ghost text-xs flex items-center gap-1">
              {t('dashboard.manage')} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {teams.length > 0 ? (
            <div className="space-y-2">
              {teams.map((team: any) => {
                const isCaptain = captainedIds.includes(team.id);
                return (
                  <Link key={team.id} to={`/teams/${team.id}`} className="group flex items-center gap-3 p-3.5 bg-surface-400 rounded-xl hover:bg-surface-300 transition-all">
                    <div className="w-10 h-10 bg-surface-500 rounded-xl flex items-center justify-center shrink-0">
                      {team.logo_url ? (
                        <img src={team.logo_url} alt="" className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        <Shield className={`w-5 h-5 ${isCaptain ? 'text-yellow-400' : 'text-valorant'}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white group-hover:text-valorant transition-colors">{team.name}</p>
                        {isCaptain && <span className="px-1.5 py-0.5 bg-yellow-500/15 text-yellow-400 text-[9px] font-medium rounded">{t('dashboard.captain')}</span>}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{team.members_count || 0} {t('dashboard.members')} • {team.total_matches || 0} {t('dashboard.maç')}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {team.total_matches > 0 && (
                        <div className="text-right">
                          <div className="text-xs font-semibold text-green-400">{team.total_wins || 0}{t('dashboard.winsAbbr')}</div>
                          <div className="text-[10px] text-gray-600">{team.total_losses || 0}{t('dashboard.lossesAbbr')}</div>
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <div className="w-14 h-14 bg-surface-400 rounded-2xl flex items-center justify-center mb-3">
                <Users className="w-7 h-7 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-400 mb-3">{t('dashboard.noTeams')}</p>
              <Link to="/teams/create" className="btn-primary text-xs px-4 py-2">{t('dashboard.createTeam')}</Link>
            </div>
          )}
        </div>

        {/* Tournaments */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h2 className="section-title mb-0">{t('dashboard.myTournaments')}</h2>
                <p className="text-[10px] text-gray-500">{tournaments.length} {t('dashboard.tournamentCount')}</p>
              </div>
            </div>
            <Link to="/tournaments" className="btn-ghost text-xs flex items-center gap-1">
              {t('dashboard.explore')} <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {tournaments.length > 0 ? (
            <div className="space-y-2">
              {tournaments.map((tourn: any) => (
                <Link key={tourn.id} to={`/tournaments/${tourn.id}`} className="group flex items-center gap-3 p-3.5 bg-surface-400 rounded-xl hover:bg-surface-300 transition-all">
                  <div className="w-10 h-10 bg-surface-500 rounded-xl flex items-center justify-center shrink-0">
                    <Trophy className="w-5 h-5 text-valorant" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white group-hover:text-valorant transition-colors">{tourn.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{tourn.game} • {tourn.participants_count || 0}/{tourn.max_teams} {t('dashboard.teamCount')}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {tourn.prize_pool > 0 && (
                      <span className="text-xs font-semibold text-yellow-500">{tourn.prize_pool.toLocaleString()} TL</span>
                    )}
                    <StatusBadge status={tourn.status} />
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
              <div className="w-14 h-14 bg-surface-400 rounded-2xl flex items-center justify-center mb-3">
                <Gamepad2 className="w-7 h-7 text-gray-600" />
              </div>
              <p className="text-sm font-medium text-gray-400 mb-3">{t('dashboard.notParticipated')}</p>
              <Link to="/tournaments" className="btn-primary text-xs px-4 py-2">{t('dashboard.discover')}</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
