import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Shield, Plus, UserPlus, X, Check, Swords, CheckCircle } from 'lucide-react';
import { teamService } from '../services/team';
import { tournamentService } from '../services/tournament';
import type { Team, TeamInvitation, Tournament } from '../types';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { useTranslation } from '../hooks/useTranslation';

export default function MyTeamsPage() {
  const { t } = useTranslation();
  const [captainedTeams, setCaptainedTeams] = useState<Team[]>([]);
  const [memberTeams, setMemberTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [pendingCheckIns, setPendingCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const user = useAuthStore((s) => s.user);

  const loadData = async () => {
    try {
      const [teamsRes, invites, checkIns] = await Promise.all([
        teamService.myTeams(),
        teamService.invitations(),
        tournamentService.pendingCheckIn().catch(() => []),
      ]);
      setCaptainedTeams(teamsRes.captained_teams || []);
      setMemberTeams(teamsRes.member_teams || []);
      setInvitations(invites);
      setPendingCheckIns(checkIns || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    try {
      await teamService.joinByCode(joinCode.trim());
      toast.success(t('teams.joinSuccess'));
      setJoinCode('');
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('teams.joinFailed'));
    }
  };

  const handleLeave = async (teamId: number) => {
    try {
      await teamService.leave(teamId);
      toast.success(t('teams.leaveSuccess'));
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  const handleInvitation = async (id: number, accept: boolean) => {
    try {
      if (accept) {
        await teamService.acceptInvitation(id);
        toast.success(t('teams.inviteAccepted'));
      } else {
        await teamService.declineInvitation(id);
      }
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t('common.error'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-valorant border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="section-title">{t('teams.myTeams')}</h1>
          <p className="text-gray-400 mt-1">{t('teams.myTeamsDesc')}</p>
        </div>
        <Link to="/teams/create" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Takım Oluştur
        </Link>
      </div>

      {/* Pending Check-ins */}
      {pendingCheckIns.length > 0 && (
        <div className="card border border-yellow-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Swords className="w-5 h-5 text-yellow-400" />
            <h2 className="section-title mb-0">{t('teams.pendingCheckins')}</h2>
          </div>
          <div className="space-y-3">
            {pendingCheckIns.map((checkin: any) => {
              const myTeam = checkin.participants?.[0];
              return (
                <div key={checkin.id} className="flex items-center justify-between p-3 bg-surface-400 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Swords className="w-5 h-5 text-valorant" />
                    <div>
                      <p className="text-sm font-medium text-white">{checkin.name}</p>
                      <p className="text-xs text-gray-500">{myTeam?.name} {t('teams.participatingWith')}</p>
                    </div>
                  </div>
                  <Link
                    to={`/tournaments/${checkin.id}`}
                    className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3 h-3" />
                    {t('tournaments.checkIn')}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Join by Code */}
      <div className="card">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="input-field flex-1 uppercase"
            placeholder={t('teams.joinCode')}
            maxLength={8}
          />
          <button onClick={handleJoin} className="btn-primary">
            {t('teams.join')}
          </button>
        </div>
      </div>

      {/* Invitations */}
      {invitations.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">{t('teams.pendingInvites')}</h2>
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 bg-surface-400 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-valorant" />
                  <div>
                    <p className="text-sm font-medium text-white">{inv.team?.name}</p>
                    <p className="text-xs text-gray-500">{t('teams.invitedBy')} {inv.inviter?.name}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleInvitation(inv.id, true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30"
                  >
                    <Check className="w-4 h-4" />
                    {t('teams.accept')}
                  </button>
                  <button
                    onClick={() => handleInvitation(inv.id, false)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
                  >
                    <X className="w-4 h-4" />
                    {t('teams.reject')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Captained Teams */}
      {captainedTeams.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">{t('teams.captainTeams')}</h2>
          <div className="space-y-3">
            {captainedTeams.map((team) => (
              <Link key={team.id} to={`/teams/${team.id}`} className="flex items-center justify-between p-3 bg-surface-400 rounded-lg hover:bg-surface-300 transition-colors">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-white">{team.name}</p>
                    <p className="text-xs text-gray-500">{team.members_count || 0}/7 {t('teams.memberCount')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{team.code}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Member Teams */}
      {memberTeams.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">{t('teams.memberTeams')}</h2>
          <div className="space-y-3">
            {memberTeams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-3 bg-surface-400 rounded-lg">
                <Link to={`/teams/${team.id}`} className="flex items-center gap-3 flex-1">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{team.name}</p>
                    <p className="text-xs text-gray-500">{t('teams.captainLabel')} {team.captain?.name}</p>
                  </div>
                </Link>
                {team.captain_id !== user?.id && (
                  <button
                    onClick={() => handleLeave(team.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    {t('teams.leave')}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {captainedTeams.length === 0 && memberTeams.length === 0 && (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">{t('teams.myTeamsEmpty')}</p>
          <Link to="/teams/create" className="btn-primary">
            {t('teams.create')}
          </Link>
        </div>
      )}
    </div>
  );
}
