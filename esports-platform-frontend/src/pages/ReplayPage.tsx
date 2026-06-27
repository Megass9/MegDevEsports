import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, Upload, HelpCircle, FileVideo, Monitor, ChevronRight, ExternalLink } from 'lucide-react';
import { matchService } from '../services/match';
import toast from 'react-hot-toast';

export default function SupportPage() {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    matchService.myMatches()
      .then((res) => setMatches(res.matches || res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (matchId: number, file: File) => {
    setUploading((prev) => ({ ...prev, [matchId]: true }));
    try {
      const formData = new FormData();
      formData.append('replay', file);
      formData.append('type', 'replay');
      formData.append('score', '0');
      const res = await matchService.submitResult(matchId, formData);
      if (res?.result?.screenshot) {
        setMatches((prev) =>
          prev.map((m) =>
            m.id === matchId ? { ...m, has_replay: true } : m
          )
        );
      }
      toast.success('Replay yüklendi!');
    } catch {
      toast.error('Yükleme başarısız.');
    } finally {
      setUploading((prev) => ({ ...prev, [matchId]: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-valorant/10 rounded-xl flex items-center justify-center">
          <HelpCircle className="w-5 h-5 text-valorant" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Destek</h1>
          <p className="text-sm text-gray-400">Maç kanıtlarını yükle ve destek talebi oluştur</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Film className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Replay Yükle</h3>
              <p className="text-xs text-gray-500">Maç videolarını ve replay dosyalarını yükle</p>
            </div>
          </div>
          <p className="text-xs text-gray-600 mb-4">
            Tamamlanan maçlarına ait video kanıtlarını buradan yükleyebilirsin.
            Yüklenen replikler admin tarafından incelenir.
          </p>
          <button onClick={() => navigate('/replays')} className="btn-primary text-xs w-full flex items-center justify-center gap-1">
            Replay Yükle <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <FileVideo className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Nasıl Çalışır?</h3>
              <p className="text-xs text-gray-500">Replay yükleme adımları</p>
            </div>
          </div>
          <ol className="text-xs text-gray-500 space-y-2 list-decimal list-inside">
            <li>Maçını oyna ve video kaydını al</li>
            <li>MP4, WebM veya MOV formatında kaydet</li>
            <li>Bu sayfadan ilgili maça replay'i yükle</li>
            <li>Admin incelemesini bekle</li>
          </ol>
        </div>
      </div>

      {/* Recent Matches */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-gray-400" />
            <h2 className="section-title mb-0">Son Maçların</h2>
          </div>
          <Link to="/matches" className="text-xs text-valorant hover:underline">Tümünü Gör</Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-valorant border-t-transparent rounded-full" />
          </div>
        ) : matches.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-gray-500">
            <Film className="w-10 h-10 text-gray-600 mb-2" />
            <p className="text-sm">Henüz maçın bulunmuyor.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.slice(0, 5).map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-surface-400 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-sm font-medium text-white truncate">
                    {match.team1?.name || 'TBD'}
                  </span>
                  <span className="text-xs text-gray-600">VS</span>
                  <span className="text-sm font-medium text-white truncate">
                    {match.team2?.name || 'TBD'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  {(match.status === 'awaiting_confirmation' || match.status === 'completed') ? (
                    <label className="btn-ghost text-xs cursor-pointer flex items-center gap-1">
                      <Upload className="w-3 h-3" />
                      {uploading[match.id] ? '...' : 'Replay'}
                      <input
                        type="file"
                        accept="video/*,.mp4,.webm,.mov,.avi"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUpload(match.id, file);
                        }}
                      />
                    </label>
                  ) : (
                    <span className="text-xs text-gray-600">Bekliyor</span>
                  )}
                  <Link to={`/matches/${match.id}`} className="text-xs text-gray-400 hover:text-white">
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
