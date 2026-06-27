import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Swords, Calendar, Trophy, AlertCircle, Loader2, Users, ArrowLeft, Upload, CheckCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { matchService } from '../services/match';
import type { Match } from '../types';
import { formatDate, getStatusColor, getStatusLabel } from '../utils/format';
import { useAuthStore } from '../store/authStore';
import Countdown from '../components/Countdown';
import toast from 'react-hot-toast';

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((s) => s.user);
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    matchService.getById(Number(id))
      .then((res) => {
        setMatch(res.match || res.data?.match);
      })
      .catch(() => setError('Maç bulunamadı.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const url = `/api/matches/${id}/live`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(url);

      eventSource.addEventListener('score_update', (e) => {
        try {
          const data = JSON.parse(e.data);
          setMatch((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              team1_score: data.team1_score,
              team2_score: data.team2_score,
              winner_id: data.winner_id,
              status: data.status,
              team1: data.team1 ? { ...prev.team1, ...data.team1 } : prev.team1,
              team2: data.team2 ? { ...prev.team2, ...data.team2 } : prev.team2,
              winner: data.winner || prev.winner,
            };
          });
        } catch {}
      });

      eventSource.onerror = () => {
        eventSource?.close();
      };
    } catch {
      console.warn('SSE bağlantısı kurulamadı, polling kullanılıyor.');
    }

    return () => {
      eventSource?.close();
    };
  }, [id]);

  const isParticipant = match && user && (
    match.team1?.captain_id === user.id ||
    match.team2?.captain_id === user.id
  );

  const handleSubmit = async () => {
    if (!score || !match) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('score', score);
      formData.append('team_id', String(match.team1?.captain_id === user?.id ? match.team1_id : match.team2_id));
      if (screenshot) formData.append('screenshot', screenshot);
      await matchService.submitResult(match.id, formData);
      toast.success('Sonuç gönderildi!');
      const res = await matchService.getById(match.id);
      setMatch(res.match || res.data?.match);
      setScore('');
      setScreenshot(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-valorant animate-spin" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="card text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400">{error || 'Maç bulunamadı.'}</p>
          <Link to="/matches" className="btn-primary mt-4 inline-block">
            Maçlara Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/matches" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Maçlara Dön
      </Link>

      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Maç Detayı</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Trophy className="w-3 h-3" />
              {match.tournament?.name}
              <span className="text-gray-600">|</span>
              <span>Round {match.round}</span>
              <span className="text-gray-600">|</span>
              <span className={`${getStatusColor(match.status)}`}>{getStatusLabel(match.status)}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="card p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <div className="w-16 h-16 bg-surface-400 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-valorant" />
            </div>
            <p className="text-xl font-semibold text-white">{match.team1?.name || 'TBD'}</p>
          </div>

          <div className="flex items-center gap-4 px-8">
            {match.team1_score !== null ? (
              <div className="text-center">
                <div className="flex items-center gap-4">
                  <span className={`text-5xl font-display font-bold ${match.winner_id === match.team1_id ? 'text-green-400' : 'text-white'}`}>
                    {match.team1_score}
                  </span>
                  <span className="text-3xl text-gray-600 font-display">:</span>
                  <span className={`text-5xl font-display font-bold ${match.winner_id === match.team2_id ? 'text-green-400' : 'text-white'}`}>
                    {match.team2_score}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex items-center gap-4">
                  <span className="text-3xl text-gray-500">-</span>
                  <span className="text-2xl text-gray-600 font-display">VS</span>
                  <span className="text-3xl text-gray-500">-</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 text-center">
            <div className="w-16 h-16 bg-surface-400 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-valorant" />
            </div>
            <p className="text-xl font-semibold text-white">{match.team2?.name || 'TBD'}</p>
          </div>
        </div>

        {match.winner && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
            <Trophy className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-green-400 font-semibold">{match.winner.name} kazandı!</p>
          </div>
        )}
      </div>

      {match.scheduled_at && (
        <div className="card mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              {formatDate(match.scheduled_at)}
            </div>
            {match.status === 'scheduled' && (
              <Countdown targetDate={match.scheduled_at} />
            )}
          </div>
        </div>
      )}

      {match.dispute_reason && (
        <div className="card mt-4 border-red-500/20">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-red-400">İhtilaflı Maç</span>
          </div>
          <p className="text-sm text-gray-400">{match.dispute_reason}</p>
        </div>
      )}

      {isParticipant && match.status !== 'completed' && (
        <div className="card mt-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Sonuç Gönder</h3>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="Skorun (0-99)"
              min={0}
              max={99}
              className="input-field w-24 text-center text-lg font-bold"
            />
            <label className="btn-ghost text-sm cursor-pointer flex items-center gap-2">
              <Upload className="w-4 h-4" />
              {screenshot ? screenshot.name : 'Screenshot'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
              />
            </label>
            <button
              onClick={handleSubmit}
              disabled={!score || submitting}
              className="btn-primary text-sm flex items-center gap-2 disabled:opacity-30"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Gönder
            </button>
          </div>
        </div>
      )}

      {match.results && match.results.length > 0 && (
        <div className="card mt-4">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Maç Sonuçları</h3>
          <div className="space-y-2">
            {match.results.map((result: any) => (
              <div key={result.id} className="bg-surface-400 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{result.submitter?.name || 'Bilinmiyor'}</span>
                  <span className="text-white font-medium">{result.score}</span>
                </div>
                {result.ocr_team1_score !== null && (
                  <div className="mt-2 pt-2 border-t border-surface-300/20 flex items-center gap-3 text-xs">
                    <span className="text-gray-500">OCR: {result.ocr_team1_score} - {result.ocr_team2_score}</span>
                    <span className={`px-2 py-0.5 rounded-full ${
                      result.ocr_status === 'matched' ? 'bg-green-500/20 text-green-400' :
                      result.ocr_status === 'mismatched' ? 'bg-red-500/20 text-red-400' :
                      result.ocr_status === 'accepted' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {result.ocr_status === 'matched' ? 'Doğrulandı' :
                       result.ocr_status === 'mismatched' ? 'Uyuşmazlık' :
                       result.ocr_status === 'accepted' ? 'Kabul Edildi' :
                       result.ocr_status === 'rejected' ? 'Reddedildi' :
                       'Beklemede'}
                    </span>
                    <span className="text-gray-500">%{result.ocr_confidence?.toFixed(0)} güven</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
