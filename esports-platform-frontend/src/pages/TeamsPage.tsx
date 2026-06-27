import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Users, Search, Trophy, Shield } from 'lucide-react';
import { teamService } from '../services/team';
import { useAuthStore } from '../store/authStore';
import type { Team } from '../types';

export default function TeamsPage() {
  const user = useAuthStore((s) => s.user);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    teamService.list()
      .then((res) => setTeams(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">Takımlar</h1>
          <p className="text-gray-400 mt-1">Tüm Valorant takımlarını keşfedin</p>
        </div>
        <Link to="/teams/create" className="btn-primary">
          Takım Oluştur
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
          placeholder="Takım ara..."
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-valorant border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Takım bulunamadı.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((team) => (
            <Link key={team.id} to={`/teams/${team.id}`} className="card card-hover group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-surface-400 rounded-xl flex items-center justify-center">
                  {team.logo_url ? (
                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Shield className="w-7 h-7 text-valorant" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white group-hover:text-valorant transition-colors truncate">
                    {team.name}
                  </h3>
                  <p className="text-xs text-gray-500">Kaptan: {team.captain?.name}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-surface-400 text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <Users className="w-4 h-4" />
                  <span>{team.members_count || 0}/7</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-green-400 font-medium">{team.total_wins}G</span>
                  <span className="text-red-400 font-medium">{team.total_losses}M</span>
                  <span className="text-gray-500">%{team.win_rate}</span>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-1 text-yellow-500 text-sm">
                <Trophy className="w-4 h-4" />
                <span className="font-semibold">{team.points} Puan</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
