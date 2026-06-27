import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Medal, TrendingUp, Shield } from 'lucide-react';
import { rankingService } from '../services/ranking';
import type { Ranking } from '../types';

export default function RankingPage() {
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rankingService.getGlobal()
      .then((res) => setRankings(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm text-gray-500 w-5 text-center">{rank}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="section-title">Global Sıralama</h1>
        <p className="text-gray-400 mt-1">En iyi takımlar ve istatistikleri</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-valorant border-t-transparent rounded-full mx-auto" />
        </div>
      ) : rankings.length === 0 ? (
        <div className="card text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Henüz sıralama verisi bulunmuyor.</p>
        </div>
      ) : (
        <div className="card">
          <div className="space-y-2">
            {rankings.map((r, i) => (
              <Link
                key={r.id}
                to={`/teams/${r.team_id}`}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-surface-400 transition-colors"
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(r.rank)}
                </div>
                <div className="w-10 h-10 bg-surface-400 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-valorant" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{r.team?.name}</p>
                  <p className="text-xs text-gray-500">Kaptan: {r.team?.captain?.name}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-white font-bold">{r.points}</p>
                    <p className="text-[10px] text-gray-500">Puan</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-400 font-bold">{r.wins}</p>
                    <p className="text-[10px] text-gray-500">G</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-400 font-bold">{r.losses}</p>
                    <p className="text-[10px] text-gray-500">M</p>
                  </div>
                  <div className="text-center min-w-[50px]">
                    <p className="text-white font-bold">%{r.win_rate}</p>
                    <p className="text-[10px] text-gray-500">Oran</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
