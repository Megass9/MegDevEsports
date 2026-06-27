import { useEffect, useState } from 'react';
import {
  Swords, Trophy, Plus, X, Play, CheckCircle, DoorOpen, Edit3, Search,
  AlertCircle, Ban, Calendar, Users, Coins, ChevronRight, ChevronDown,
  Flag, Shield, Clock, CheckCircle2, AlertTriangle, Loader2, Save,
  Scale, GripVertical, Eye
} from 'lucide-react';
import { adminService } from '../../services/admin';
import { tournamentService } from '../../services/tournament';
import { getStatusColor, getStatusLabel, formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

const GAMES = [
  { value: 'valorant', label: 'Valorant', color: 'text-red-400' },
  { value: 'lol', label: 'League of Legends', color: 'text-yellow-400' },
  { value: 'cs2', label: 'CS2', color: 'text-orange-400' },
  { value: 'dota2', label: 'Dota 2', color: 'text-green-400' },
];

const getMatchStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    scheduled: 'bg-gray-500/20 text-gray-300',
    ongoing: 'bg-blue-500/20 text-blue-400',
    awaiting_confirmation: 'bg-yellow-500/20 text-yellow-400',
    confirmed: 'bg-green-500/20 text-green-400',
    disputed: 'bg-red-500/20 text-red-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
  };
  const labels: Record<string, string> = {
    scheduled: 'Planlandı', ongoing: 'Devam Ediyor',
    awaiting_confirmation: 'Onay Bekliyor', confirmed: 'Onaylandı',
    disputed: 'İhtilaflı', completed: 'Tamamlandı',
  };
  const icons: Record<string, any> = {
    scheduled: Clock, ongoing: Loader2, awaiting_confirmation: AlertTriangle,
    confirmed: CheckCircle2, disputed: AlertCircle, completed: CheckCircle,
  };
  const Icon = icons[status] || Clock;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${styles[status] || styles.scheduled}`}>
      <Icon className={`w-3 h-3 ${status === 'ongoing' ? 'animate-spin' : ''}`} />
      {labels[status] || status}
    </span>
  );
};

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [game, setGame] = useState('valorant');
  const [maxTeams, setMaxTeams] = useState(8);
  const [startDate, setStartDate] = useState('');
  const [prizePool, setPrizePool] = useState(0);
  const [format, setFormat] = useState('single_elimination');

  // Edit modal
  const [editModal, setEditModal] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editGame, setEditGame] = useState('valorant');
  const [editMaxTeams, setEditMaxTeams] = useState(8);
  const [editStartDate, setEditStartDate] = useState('');
  const [editPrizePool, setEditPrizePool] = useState(0);
  const [editFormat, setEditFormat] = useState('single_elimination');

  // Match & Bracket
  const [matchModal, setMatchModal] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [bracket, setBracket] = useState<any>(null);
  const [scores, setScores] = useState<Record<number, { t1: string; t2: string }>>({});
  const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>({});
  const [bracketView, setBracketView] = useState(false);

  // Complete/Cancel modals
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completeWinnerId, setCompleteWinnerId] = useState('');
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Check-in
  const [checkInModal, setCheckInModal] = useState<any>(null);
  const [checkInData, setCheckInData] = useState<any>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);

  const openCheckIn = async (tournament: any) => {
    setCheckInModal(tournament);
    setCheckInLoading(true);
    try {
      const data = await adminService.checkInStatus(tournament.id);
      setCheckInData(data);
    } catch {
      toast.error('Check-in durumu yüklenemedi.');
    } finally {
      setCheckInLoading(false);
    }
  };

  // Dispute
  const [showDisputes, setShowDisputes] = useState(false);
  const [disputeMatches, setDisputeMatches] = useState<any[]>([]);
  const [disputeScores, setDisputeScores] = useState<Record<number, { t1: string; t2: string }>>({});
  const [disputeLoading, setDisputeLoading] = useState(false);

  const load = () => {
    setLoading(true);
    adminService.tournaments()
      .then((res) => setTournaments(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = tournaments.filter((t: any) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  // Create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createTournament({
        name, description, game,
        max_teams: maxTeams, start_date: startDate, prize_pool: prizePool,
        type: format,
      });
      toast.success('Turnuva oluşturuldu.');
      setShowCreate(false);
      setName(''); setDescription(''); setGame('valorant');
      setMaxTeams(8); setStartDate(''); setPrizePool(0); setFormat('single_elimination');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hata oluştu.');
    }
  };

  // Edit
  const openEdit = (t: any) => {
    setEditModal(t);
    setEditName(t.name);
    setEditDesc(t.description || '');
    setEditGame(t.game || 'valorant');
    setEditMaxTeams(t.max_teams);
    setEditStartDate(t.start_date ? t.start_date.slice(0, 16) : '');
    setEditPrizePool(t.prize_pool);
    setEditFormat(t.type || 'single_elimination');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    try {
      await adminService.updateTournament(editModal.id, {
        name: editName, description: editDesc, game: editGame,
        max_teams: editMaxTeams, start_date: editStartDate, prize_pool: editPrizePool,
        type: editFormat,
      });
      toast.success('Turnuva güncellendi.');
      setEditModal(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hata oluştu.');
    }
  };

  // Match modal
  const openMatchModal = async (tournament: any) => {
    try {
      const data = await tournamentService.getById(tournament.id);
      setMatchModal(tournament);
      setBracket(data.bracket || null);
      const matchList = data.tournament.matches || [];
      setMatches(matchList);
      const initial: Record<number, { t1: string; t2: string }> = {};
      matchList.forEach((m: any) => {
        initial[m.id] = { t1: m.team1_score ?? '', t2: m.team2_score ?? '' };
      });
      setScores(initial);
      // OCR ile algılanan skorları otomatik doldur
      matchList.forEach((m: any) => {
        m.results?.forEach((r: any) => {
          if (r.ocr_team1_score !== null && r.ocr_team2_score !== null) {
            initial[m.id] = { t1: String(r.ocr_team1_score), t2: String(r.ocr_team2_score) };
          }
        });
      });
      setScores({ ...initial });
      const rounds: Record<number, boolean> = {};
      matchList.forEach((m: any) => { rounds[m.round] = true; });
      setExpandedRounds(rounds);
      setBracketView(false);
    } catch {
      toast.error('Maçlar yüklenemedi.');
    }
  };

  const handleSetResult = async (matchId: number) => {
    const s = scores[matchId];
    if (s.t1 === '' || s.t2 === '') { toast.error('Skor girin.'); return; }
    try {
      await adminService.setMatchResult(matchId, parseInt(s.t1), parseInt(s.t2));
      toast.success('Maç sonucu kaydedildi.');
      const data = await tournamentService.getById(matchModal.id);
      setMatches(data.tournament.matches || []);
      setBracket(data.bracket || null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hata oluştu.');
    }
  };

  // Disputes
  const loadDisputes = async () => {
    setDisputeLoading(true);
    try {
      const allMatches: any[] = [];
      for (const t of tournaments) {
        const data = await tournamentService.getById(t.id);
        const disputed = (data.tournament.matches || []).filter((m: any) => m.status === 'disputed');
        disputed.forEach((m: any) => { m._tournamentName = t.name; });
        allMatches.push(...disputed);
      }
      setDisputeMatches(allMatches);
      const initial: Record<number, { t1: string; t2: string }> = {};
      allMatches.forEach((m: any) => {
        initial[m.id] = { t1: m.team1_score ?? '', t2: m.team2_score ?? '' };
      });
      setDisputeScores(initial);
      setShowDisputes(true);
    } catch {
      toast.error('İhtilaflar yüklenemedi.');
    } finally {
      setDisputeLoading(false);
    }
  };

  const handleResolveDispute = async (matchId: number, action: string) => {
    try {
      const s = disputeScores[matchId];
      if (action === 'set_result') {
        if (s.t1 === '' || s.t2 === '') { toast.error('Skor girin.'); return; }
        await adminService.resolveDispute(matchId, action, parseInt(s.t1), parseInt(s.t2));
      } else {
        await adminService.resolveDispute(matchId, action);
      }
      toast.success('İhtilaf çözüldü.');
      setDisputeMatches((prev) => prev.filter((m: any) => m.id !== matchId));
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hata oluştu.');
    }
  };

  // Actions
  const handleCancel = async () => {
    if (!cancelId || !cancelReason.trim()) return;
    try {
      await adminService.cancelTournament(cancelId, cancelReason);
      toast.success('Turnuva iptal edildi.');
      setShowCancelModal(false); setCancelId(null); setCancelReason(''); load();
    } catch { toast.error('Hata oluştu.'); }
  };

  const handleOpenRegistration = async (id: number) => {
    try { await adminService.openRegistration(id); toast.success('Turnuva kayda açıldı.'); load(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Hata oluştu.'); }
  };

  const handleStart = async (id: number) => {
    if (!confirm('Turnuvayı başlatmak istediğinize emin misiniz?')) return;
    try { await adminService.startTournament(id); toast.success('Turnuva başlatıldı.'); load(); }
    catch (err: any) { toast.error(err.response?.data?.message || 'Hata oluştu.'); }
  };

  const handleComplete = async () => {
    if (!completingId || !completeWinnerId) return;
    try {
      await adminService.completeTournament(completingId, parseInt(completeWinnerId));
      toast.success('Turnuva tamamlandı.');
      setShowCompleteModal(false); setCompletingId(null); setCompleteWinnerId(''); load();
    } catch (err: any) { toast.error(err.response?.data?.message || 'Hata oluştu.'); }
  };

  const getGameIcon = (g: string) => GAMES.find(x => x.value === g)?.label || g;

  const rounds = [...new Set(matches.map((m: any) => m.round))].sort((a, b) => a - b);

  // Bracket renderer
  const renderBracket = () => {
    if (!bracket?.rounds) return null;
    const maxRound = bracket.rounds.length;

    return (
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-[600px]">
          {bracket.rounds.map((round: any, ri: number) => (
            <div key={ri} className="flex-1 min-w-[180px]">
              <div className="text-xs font-semibold text-gray-400 mb-3 text-center uppercase tracking-wide">
                {ri === maxRound - 1 ? 'Final' : ri === maxRound - 2 ? 'Yarı Final' : `Round ${round.round}`}
              </div>
              <div className="space-y-3">
                {round.matches.map((bm: any) => {
                  const t1Won = bm.winner && bm.team1?.id === bm.winner.id;
                  const t2Won = bm.winner && bm.team2?.id === bm.winner.id;
                  const isBye = !bm.team2;
                  return (
                    <div key={bm.match_id} className={`bg-surface-400 rounded-lg p-3 border ${
                      bm.winner ? 'border-green-500/20' : 'border-surface-300'
                    }`}>
                      <div className={`flex items-center justify-between py-1.5 px-2 rounded ${
                        t1Won ? 'bg-green-500/10' : ''
                      }`}>
                        <span className={`text-xs font-medium truncate flex-1 ${
                          t1Won ? 'text-green-400' : bm.team1 ? 'text-white' : 'text-gray-600'
                        }`}>
                          {bm.team1?.name || '—'}
                        </span>
                        <span className={`text-xs font-bold ml-2 ${
                          t1Won ? 'text-green-400' : 'text-gray-400'
                        }`}>
                          {bm.scores?.team1 ?? ''}
                        </span>
                      </div>
                      {!isBye && (
                        <>
                          <div className="border-t border-surface-300 my-1" />
                          <div className={`flex items-center justify-between py-1.5 px-2 rounded ${
                            t2Won ? 'bg-green-500/10' : ''
                          }`}>
                            <span className={`text-xs font-medium truncate flex-1 ${
                              t2Won ? 'text-green-400' : bm.team2 ? 'text-white' : 'text-gray-600'
                            }`}>
                              {bm.team2?.name || '—'}
                            </span>
                            <span className={`text-xs font-bold ml-2 ${
                              t2Won ? 'text-green-400' : 'text-gray-400'
                            }`}>
                              {bm.scores?.team2 ?? ''}
                            </span>
                          </div>
                        </>
                      )}
                      {isBye && <div className="text-[10px] text-gray-600 text-center mt-1">Bay</div>}
                      {bm.status && (
                        <div className="mt-1.5 text-center">{getMatchStatusBadge(bm.status)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Turnuva Yönetimi</h1>
          <p className="text-sm text-gray-400 mt-1">Tüm turnuvaları görüntüleyin ve yönetin</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadDisputes} className="btn-secondary flex items-center gap-2">
            <Scale className="w-4 h-4" />
            İhtilaflar
          </button>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Turnuva Oluştur
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" placeholder="Turnuva ara..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 w-full sm:w-80" />
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowCreate(false)}>
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-white">Yeni Turnuva</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Turnuva Adı</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Oyun</label>
                <select value={game} onChange={(e) => setGame(e.target.value)} className="input-field w-full">
                  {GAMES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Açıklama</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="input-field w-full" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Maks. Takım</label>
                  <select value={maxTeams} onChange={(e) => setMaxTeams(parseInt(e.target.value))} className="input-field w-full">
                    {[2, 4, 8, 16, 32, 64].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ödül (TL)</label>
                  <input type="number" value={prizePool} onChange={(e) => setPrizePool(parseFloat(e.target.value))} className="input-field w-full" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Turnuva Formatı</label>
                <select value={format} onChange={(e) => setFormat(e.target.value)} className="input-field w-full">
                  <option value="single_elimination">Tek Eleme</option>
                  <option value="double_elimination">Çift Eleme</option>
                  <option value="round_robin">Round Robin</option>
                  <option value="swiss">İsviçre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Başlangıç Tarihi</label>
                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field w-full" required />
              </div>
              <button type="submit" className="btn-primary w-full">Oluştur</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setEditModal(null)}>
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-white">Turnuvayı Düzenle</h2>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Turnuva Adı</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Oyun</label>
                <select value={editGame} onChange={(e) => setEditGame(e.target.value)} className="input-field w-full">
                  {GAMES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Açıklama</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="input-field w-full" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Maks. Takım</label>
                  <select value={editMaxTeams} onChange={(e) => setEditMaxTeams(parseInt(e.target.value))} className="input-field w-full">
                    {[2, 4, 8, 16, 32, 64].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Ödül (TL)</label>
                  <input type="number" value={editPrizePool} onChange={(e) => setEditPrizePool(parseFloat(e.target.value))} className="input-field w-full" min="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Turnuva Formatı</label>
                <select value={editFormat} onChange={(e) => setEditFormat(e.target.value)} className="input-field w-full">
                  <option value="single_elimination">Tek Eleme</option>
                  <option value="double_elimination">Çift Eleme</option>
                  <option value="round_robin">Round Robin</option>
                  <option value="swiss">İsviçre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Başlangıç Tarihi</label>
                <input type="datetime-local" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} className="input-field w-full" required />
              </div>
              <button type="submit" className="btn-primary w-full">Kaydet</button>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowCancelModal(false)}>
          <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-white">Turnuvayı İptal Et</h2>
              <button onClick={() => setShowCancelModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="input-field w-full mb-4" rows={3} placeholder="İptal sebebi..." />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCancelModal(false)} className="btn-secondary">Vazgeç</button>
              <button onClick={handleCancel} disabled={!cancelReason.trim()} className="btn-danger">İptal Et</button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowCompleteModal(false)}>
          <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-white">Turnuvayı Tamamla</h2>
              <button onClick={() => setShowCompleteModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <input type="number" value={completeWinnerId} onChange={(e) => setCompleteWinnerId(e.target.value)} className="input-field w-full mb-4" placeholder="Kazanan Takım ID" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowCompleteModal(false)} className="btn-secondary">Vazgeç</button>
              <button onClick={handleComplete} disabled={!completeWinnerId} className="btn-primary">Tamamla</button>
            </div>
          </div>
        </div>
      )}

      {/* Disputes Modal */}
      {showDisputes && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setShowDisputes(false)}>
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-400">
              <div>
                <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Scale className="w-5 h-5 text-red-400" />
                  İhtilaflı Maçlar
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Takımlar tarafından ihtilafa düşülen maçlar</p>
              </div>
              <button onClick={() => setShowDisputes(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {disputeLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-valorant animate-spin" /></div>
            ) : disputeMatches.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">İhtilaflı maç bulunmuyor</p>
              </div>
            ) : (
              <div className="space-y-4">
                {disputeMatches.map((m: any) => (
                  <div key={m.id} className="bg-surface-400 rounded-xl p-4 border border-red-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">{m._tournamentName} • Round {m.round}</span>
                      <span className="text-[10px] text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">İhtilaflı</span>
                    </div>
                    {m.dispute_reason && (
                      <div className="mb-3 p-2 bg-red-500/5 rounded-lg text-xs text-red-300">
                        <span className="font-medium">Sebep:</span> {m.dispute_reason}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 text-right">
                        <p className="text-sm font-medium text-white">{m.team1?.name || 'TBD'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="number" value={disputeScores[m.id]?.t1 ?? ''}
                          onChange={(e) => setDisputeScores(prev => ({ ...prev, [m.id]: { ...prev[m.id], t1: e.target.value } }))}
                          className="input-field w-14 text-center py-1.5 text-sm" placeholder="-" />
                        <span className="text-xs text-gray-600">:</span>
                        <input type="number" value={disputeScores[m.id]?.t2 ?? ''}
                          onChange={(e) => setDisputeScores(prev => ({ ...prev, [m.id]: { ...prev[m.id], t2: e.target.value } }))}
                          className="input-field w-14 text-center py-1.5 text-sm" placeholder="-" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{m.team2?.name || 'TBD'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 justify-end">
                      <button onClick={() => handleResolveDispute(m.id, 'confirm')}
                        className="btn-secondary text-xs py-1.5 px-3">Onayla</button>
                      <button onClick={() => handleResolveDispute(m.id, 'set_result')}
                        className="btn-primary text-xs py-1.5 px-3">Skorla Çöz</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tournament Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 text-valorant animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Swords className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">Henüz turnuva bulunmuyor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-400 bg-surface-400/30">
                  <th className="table-header">Turnuva</th>
                  <th className="table-header">Oyun</th>
                  <th className="table-header">Durum</th>
                  <th className="table-header">Takımlar</th>
                  <th className="table-header">Ödül</th>
                  <th className="table-header">Başlangıç</th>
                  <th className="table-header text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-400">
                {filtered.map((t: any) => (
                  <tr key={t.id} className="hover:bg-surface-400/50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-valorant/10 flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-valorant" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{t.name}</p>
                          {t.description && <p className="text-gray-500 text-xs truncate max-w-[200px]">{t.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell"><span className="text-xs text-gray-400">{getGameIcon(t.game)}</span></td>
                    <td className="table-cell">
                      <span className={`${getStatusColor(t.status)} text-xs px-2.5 py-1 rounded-full`}>{getStatusLabel(t.status)}</span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Users className="w-3.5 h-3.5 text-gray-500" />
                        <span className={t.participants_count >= t.max_teams ? 'text-green-400' : 'text-gray-300'}>{t.participants_count || 0}</span>
                        <span className="text-gray-600">/</span>
                        <span className="text-gray-500">{t.max_teams}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="text-yellow-500 font-medium text-sm">{t.prize_pool > 0 ? `${t.prize_pool.toLocaleString()} TL` : '-'}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                        <Calendar className="w-3 h-3" />{formatDate(t.start_date)}
                      </div>
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-400 rounded-lg transition-colors" title="Düzenle">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {t.status === 'pending' && (
                          <>
                            <button onClick={() => handleOpenRegistration(t.id)} className="p-1.5 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors" title="Kayıt Aç"><DoorOpen className="w-4 h-4" /></button>
                            <button onClick={() => handleStart(t.id)} className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="Başlat"><Play className="w-4 h-4" /></button>
                          </>
                        )}
                        {t.status === 'registration' && (
                          <>
                            <button onClick={() => openCheckIn(t)} className="p-1.5 text-cyan-400 hover:bg-cyan-500/20 rounded-lg transition-colors" title="Check-in Durumu"><Users className="w-4 h-4" /></button>
                            <button onClick={() => handleStart(t.id)} className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="Başlat"><Play className="w-4 h-4" /></button>
                          </>
                        )}
                        {t.status === 'in_progress' && (
                          <>
                            <button onClick={() => openMatchModal(t)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Maçları Yönet"><Swords className="w-4 h-4" /></button>
                            <button onClick={() => { setCompletingId(t.id); setShowCompleteModal(true); }} className="p-1.5 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors" title="Tamamla"><CheckCircle className="w-4 h-4" /></button>
                          </>
                        )}
                        {t.status !== 'cancelled' && t.status !== 'completed' && (
                          <button onClick={() => { setCancelId(t.id); setCancelReason(''); setShowCancelModal(true); }} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="İptal"><Ban className="w-4 h-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Check-in Modal */}
      {checkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => { setCheckInModal(null); setCheckInData(null); }}>
          <div className="card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-400">
              <div>
                <h2 className="text-lg font-display font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  {checkInModal.name}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Check-in Durumu</p>
              </div>
              <button onClick={() => { setCheckInModal(null); setCheckInData(null); }} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            {checkInLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-valorant animate-spin" /></div>
            ) : checkInData ? (
              <div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-surface-400 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-white">{checkInData.total_teams}</p>
                    <p className="text-xs text-gray-500">Toplam</p>
                  </div>
                  <div className="bg-surface-400 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-green-400">{checkInData.checked_in}</p>
                    <p className="text-xs text-gray-500">Check-in</p>
                  </div>
                  <div className="bg-surface-400 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-400">{checkInData.disqualified}</p>
                    <p className="text-xs text-gray-500">Diskalifiye</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {checkInData.participants?.map((p: any) => (
                    <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                      p.disqualified ? 'bg-red-500/10' : p.checked_in_at ? 'bg-green-500/10' : 'bg-surface-400'
                    }`}>
                      <div className="w-8 h-8 bg-surface-500 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.captain?.name}</p>
                      </div>
                      {p.disqualified ? (
                        <span className="text-xs text-red-400">Diskalifiye</span>
                      ) : p.checked_in_at ? (
                        <span className="text-xs text-green-400">Check-in yapıldı</span>
                      ) : (
                        <span className="text-xs text-yellow-400">Bekleniyor</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Match Management Modal */}
      {matchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setMatchModal(null)}>
          <div className="card max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-surface-400">
              <div>
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-2">
                  <Swords className="w-5 h-5 text-valorant" />
                  {matchModal.name}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Maçları yönetin ve sonuçları girin</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setBracketView(!bracketView)}
                  className={`btn-ghost text-xs py-1.5 px-3 ${bracketView ? 'text-valorant' : ''}`}>
                  {bracketView ? 'Liste' : 'Bracket'}
                </button>
                <button onClick={() => setMatchModal(null)} className="text-gray-400 hover:text-white p-1.5 hover:bg-surface-400 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <Shield className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm font-medium">Henüz maç oluşturulmadı</p>
              </div>
            ) : bracketView && bracket?.rounds ? (
              renderBracket()
            ) : (
              <div className="space-y-6">
                {rounds.map((round) => {
                  const roundMatches = matches.filter((m: any) => m.round === round);
                  return (
                    <div key={round} className="bg-surface-400/30 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setExpandedRounds(prev => ({ ...prev, [round]: !prev[round] }))}
                        className="w-full flex items-center justify-between px-5 py-3 bg-surface-400/50 hover:bg-surface-400 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {expandedRounds[round] ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                          <span className="text-sm font-semibold text-white">Round {round}</span>
                          <span className="text-xs text-gray-500">({roundMatches.length} maç)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {roundMatches.every((m: any) => m.winner_id) ? (
                            <span className="text-[10px] text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Tamamlandı</span>
                          ) : (
                            <span className="text-[10px] text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                              {roundMatches.filter((m: any) => !m.winner_id).length} maç kaldı
                            </span>
                          )}
                        </div>
                      </button>

                      {expandedRounds[round] && (
                        <div className="p-4 space-y-3">
                          {roundMatches.map((m: any) => {
                            const isTeam1Winner = m.winner_id && m.winner_id === m.team1_id;
                            const isTeam2Winner = m.winner_id && m.winner_id === m.team2_id;
                            return (
                              <div key={m.id} className={`bg-surface-500 rounded-xl p-4 border ${m.winner_id ? 'border-green-500/20' : 'border-surface-400'}`}>
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono text-gray-600 bg-surface-400 px-2 py-0.5 rounded">#{m.match_number}</span>
                                    {getMatchStatusBadge(m.status)}
                                    {m.results?.map((r: any) => r.ocr_status === 'matched' ? (
                                      <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/20 text-green-400">
                                        <CheckCircle2 className="w-3 h-3" />OCR Doğrulandı
                                      </span>
                                    ) : r.ocr_status === 'mismatched' ? (
                                      <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400">
                                        <AlertCircle className="w-3 h-3" />OCR Uyuşmazlığı
                                      </span>
                                    ) : r.ocr_status === 'pending' && r.ocr_team1_score !== null ? (
                                      <span key={r.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/20 text-yellow-400">
                                        <AlertTriangle className="w-3 h-3" />OCR İnceleniyor
                                      </span>
                                    ) : null)}
                                  </div>
                                  {m.winner_id && (
                                    <span className="text-[10px] text-green-400 flex items-center gap-1">
                                      <Flag className="w-3 h-3" />Kazanan: {m.winner?.name}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className={`flex-1 flex items-center gap-3 p-3 rounded-lg ${isTeam1Winner ? 'bg-green-500/10 ring-1 ring-green-500/30' : 'bg-surface-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isTeam1Winner ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/30 text-gray-400'}`}>
                                      {m.team1?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium truncate ${isTeam1Winner ? 'text-green-400' : m.team1_id ? 'text-white' : 'text-gray-500'}`}>
                                        {m.team1?.name || 'TBD'}
                                      </p>
                                      {isTeam1Winner && <p className="text-[10px] text-green-500/70">Kazanan</p>}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <input type="number" value={scores[m.id]?.t1 ?? ''}
                                      onChange={(e) => setScores(prev => ({ ...prev, [m.id]: { ...prev[m.id], t1: e.target.value } }))}
                                      disabled={!m.team1_id} className="input-field w-20 text-center py-3 text-2xl font-bold disabled:opacity-30" placeholder="-" />
                                    <span className="text-2xl font-bold text-gray-500">:</span>
                                    <input type="number" value={scores[m.id]?.t2 ?? ''}
                                      onChange={(e) => setScores(prev => ({ ...prev, [m.id]: { ...prev[m.id], t2: e.target.value } }))}
                                      disabled={!m.team2_id} className="input-field w-20 text-center py-3 text-2xl font-bold disabled:opacity-30" placeholder="-" />
                                  </div>

                                  <div className={`flex-1 flex items-center gap-3 p-3 rounded-lg ${isTeam2Winner ? 'bg-green-500/10 ring-1 ring-green-500/30' : 'bg-surface-400'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isTeam2Winner ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/30 text-gray-400'}`}>
                                      {m.team2?.name?.charAt(0) || '?'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-sm font-medium truncate ${isTeam2Winner ? 'text-green-400' : m.team2_id ? 'text-white' : 'text-gray-500'}`}>
                                        {m.team2?.name || 'TBD'}
                                      </p>
                                      {isTeam2Winner && <p className="text-[10px] text-green-500/70">Kazanan</p>}
                                    </div>
                                  </div>

                                  <button onClick={() => handleSetResult(m.id)}
                                    disabled={!m.team1_id || !m.team2_id}
                                    className="btn-primary text-xs py-2 px-4 disabled:opacity-30 whitespace-nowrap">
                                    <Save className="w-3 h-3" />
                                  </button>
                                </div>

                                {m.results?.map((r: any) => (
                                  <div key={r.id} className="mt-3 pt-3 border-t border-surface-400">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500">Gönderen: <span className="text-white">{r.submitter?.name || 'Bilinmiyor'}</span></span>
                                        <span className="text-sm font-bold text-white">Skor: {r.score}</span>
                                        {r.ocr_team1_score !== null && (
                                          <>
                                            <span className="text-xs text-gray-500">OCR:</span>
                                            <span className="text-sm font-bold text-valorant">{r.ocr_team1_score} - {r.ocr_team2_score}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                              r.ocr_confidence >= 70 ? 'bg-green-500/20 text-green-400' :
                                              r.ocr_confidence >= 40 ? 'bg-yellow-500/20 text-yellow-400' :
                                              'bg-red-500/20 text-red-400'
                                            }`}>
                                              %{r.ocr_confidence?.toFixed(0)} güven
                                            </span>
                                            {r.ocr_status === 'matched' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Eşleşti</span>}
                                            {r.ocr_status === 'mismatched' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Uyuşmazlık</span>}
                                          </>
                                        )}
                                      </div>
                                      {r.ocr_team1_score !== null && !m.winner_id && (
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={async () => {
                                              try {
                                                await adminService.acceptOcr(r.id);
                                                toast.success('OCR kabul edildi.');
                                                const data = await tournamentService.getById(matchModal.id);
                                                setMatches(data.tournament.matches || []);
                                              } catch (err: any) { toast.error(err.response?.data?.message || 'Hata'); }
                                            }}
                                            className="btn-primary text-[10px] py-1 px-2"
                                          >
                                            <CheckCircle2 className="w-3 h-3" /> Kabul Et
                                          </button>
                                          <button
                                            onClick={async () => {
                                              try {
                                                await adminService.rejectOcr(r.id);
                                                toast.success('OCR reddedildi.');
                                                setMatches(prev => prev.map(m => m.id === matchModal.id ? { ...m, results: m.results?.map((rr: any) => rr.id === r.id ? { ...rr, ocr_status: 'rejected' } : rr) } : m));
                                              } catch (err: any) { toast.error(err.response?.data?.message || 'Hata'); }
                                            }}
                                            className="btn-ghost text-[10px] py-1 px-2 text-red-400 hover:bg-red-500/20"
                                          >
                                            <X className="w-3 h-3" /> Reddet
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                    {r.screenshot && (
                                      <div className="mt-2">
                                        <a href={`/storage/match-screenshots/${r.screenshot}`} target="_blank" rel="noopener noreferrer"
                                          className="text-[10px] text-valorant hover:underline flex items-center gap-1">
                                          <Eye className="w-3 h-3" /> Screenshot Görüntüle
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
