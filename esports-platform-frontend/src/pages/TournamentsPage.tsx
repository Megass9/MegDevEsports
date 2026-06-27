import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swords, Trophy, Users, Calendar, Search, Filter } from 'lucide-react';
import { tournamentService } from '../services/tournament';
import type { Tournament } from '../types';
import { formatDate, getStatusColor } from '../utils/format';
import { useTranslation } from '../hooks/useTranslation';

export default function TournamentsPage() {
  const { t } = useTranslation();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const params: Record<string, string> = {};
    if (filter !== 'all') params.status = filter;
    tournamentService.list(params)
      .then((res) => setTournaments(res.data || res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title">{t('tournaments.title')}</h1>
          <p className="text-gray-400 mt-1">{t('tournaments.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: t('tournaments.filterAll') },
            { value: 'registration', label: t('tournaments.filterRegistration') },
            { value: 'in_progress', label: t('tournaments.filterInProgress') },
            { value: 'completed', label: t('tournaments.filterCompleted') },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.value
                  ? 'bg-valorant text-white'
                  : 'bg-surface-400 text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-valorant border-t-transparent rounded-full mx-auto" />
        </div>
      ) : tournaments.length === 0 ? (
        <div className="card text-center py-12">
          <Swords className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">{t('tournaments.noTournaments')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tourn) => (
            <Link key={tourn.id} to={`/tournaments/${tourn.id}`} className="card card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-valorant" />
                  <span className="text-xs font-medium text-gray-500 uppercase">{tourn.game}</span>
                </div>
                <span className={`${getStatusColor(tourn.status)} text-xs`}>
                  {t('tournaments.status.' + tourn.status)}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-valorant transition-colors">
                {tourn.name}
              </h3>

              {tourn.prize_pool > 0 && (
                <div className="flex items-center gap-1 text-yellow-500 text-sm mb-2">
                  <Trophy className="w-4 h-4" />
                  <span className="font-semibold">{tourn.prize_pool} TL</span>
                </div>
              )}

              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{tourn.description}</p>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{tourn.participants_count || 0}/{tourn.max_teams}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(tourn.start_date)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
