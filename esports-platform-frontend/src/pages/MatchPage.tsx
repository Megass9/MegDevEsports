import { useEffect, useState } from 'react';
import { Swords, Calendar, Trophy, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { matchService } from '../services/match';
import { tournamentService } from '../services/tournament';
import type { Match } from '../types';
import { formatDate, getStatusColor, getStatusLabel } from '../utils/format';
import { useAuthStore } from '../store/authStore';

export default function MatchPage() {
  const user = useAuthStore((s) => s.user);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = user?.role === 'admin';

  const fetchMatches = () => {
    if (isAdmin) {
      tournamentService.list()
        .then(async (res) => {
          const tournaments = res.data || [];
          const allMatches: Match[] = [];
          for (const t of tournaments) {
            try {
              const detail = await tournamentService.getById(t.id);
              if (detail.tournament?.matches) {
                allMatches.push(...detail.tournament.matches.map((m: any) => ({
                  ...m,
                  tournament: detail.tournament,
                })));
              }
            } catch {}
          }
          allMatches.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          setMatches(allMatches);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      matchService.myMatches()
        .then((res) => setMatches(res.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 15000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-valorant animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="section-title">Maçlar</h1>
        <p className="text-gray-400 mt-1">
          {isAdmin ? 'Tüm turnuva maçları' : 'Takımlarının tüm maçları'}
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="card text-center py-12">
          <Swords className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Henüz maç bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Trophy className="w-3 h-3" />
                  {match.tournament?.name}
                  <span className="text-gray-600">|</span>
                  <span>Round {match.round}</span>
                </div>
                <span className={`${getStatusColor(match.status)} text-xs`}>
                  {getStatusLabel(match.status)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <p className="text-lg font-semibold text-white">{match.team1?.name || 'TBD'}</p>
                </div>
                <div className="flex items-center gap-3 px-6">
                  {match.team1_score !== null ? (
                    <span className="text-2xl font-display font-bold">
                      <span className={match.winner_id === match.team1_id ? 'text-green-400' : 'text-white'}>
                        {match.team1_score}
                      </span>
                      <span className="text-gray-500 mx-2">-</span>
                      <span className={match.winner_id === match.team2_id ? 'text-green-400' : 'text-white'}>
                        {match.team2_score}
                      </span>
                    </span>
                  ) : (
                    <span className="text-lg text-gray-500">VS</span>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <p className="text-lg font-semibold text-white">{match.team2?.name || 'TBD'}</p>
                </div>
              </div>

              {match.scheduled_at && (
                <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {formatDate(match.scheduled_at)}
                </div>
              )}

              {match.dispute_reason && (
                <div className="flex items-center gap-2 mt-3 p-2 bg-red-500/10 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-red-400">{match.dispute_reason}</span>
                </div>
              )}

              <Link
                to={`/matches/${match.id}`}
                className="mt-3 flex items-center justify-center gap-1 text-xs text-valorant hover:text-valorant/80 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Detayı Gör
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
