import { useEffect, useState } from 'react';
import { Gift, Trophy, CheckCircle, Truck, Plus, X } from 'lucide-react';
import { adminService } from '../../services/admin';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

export default function AdminRewards() {
  const [rewards, setRewards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const [tournamentId, setTournamentId] = useState('');
  const [teamId, setTeamId] = useState('');
  const [rank, setRank] = useState(1);
  const [prize, setPrize] = useState('');

  const load = () => {
    setLoading(true);
    adminService.rewards()
      .then((res) => setRewards(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createReward({ tournament_id: tournamentId, team_id: teamId, rank, prize });
      toast.success('Ödül eklendi.');
      setShowCreate(false);
      load();
    } catch { toast.error('Hata oluştu.'); }
  };

  const handleApprove = async (id: number) => {
    try {
      await adminService.approveReward(id);
      toast.success('Ödül onaylandı. Manuel gönderim yapılacak.');
      load();
    } catch { toast.error('Hata oluştu.'); }
  };

  const handleDeliver = async (id: number) => {
    const notes = prompt('Teslimat notu (opsiyonel):');
    try {
      await adminService.deliverReward(id, notes || undefined);
      toast.success('Ödül teslim edildi olarak işaretlendi.');
      load();
    } catch { toast.error('Hata oluştu.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Ödül Yönetimi</h1>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ödül Ekle
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowCreate(false)}>
          <div className="card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-white">Yeni Ödül</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Turnuva ID</label>
                <input type="number" value={tournamentId} onChange={(e) => setTournamentId(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Takım ID</label>
                <input type="number" value={teamId} onChange={(e) => setTeamId(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Derece</label>
                <select value={rank} onChange={(e) => setRank(parseInt(e.target.value))} className="input-field">
                  <option value={1}>1.</option>
                  <option value={2}>2.</option>
                  <option value={3}>3.</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ödül</label>
                <input type="text" value={prize} onChange={(e) => setPrize(e.target.value)} className="input-field" placeholder="Örn: 5000 TL" required />
              </div>
              <button type="submit" className="btn-primary w-full">Ekle</button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-400">
                <th className="table-header">Takım</th>
                <th className="table-header">Turnuva</th>
                <th className="table-header">Derece</th>
                <th className="table-header">Ödül</th>
                <th className="table-header">Durum</th>
                <th className="table-header">Onay</th>
                <th className="table-header">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400">
              {rewards.map((r: any) => (
                <tr key={r.id} className="hover:bg-surface-400/50">
                  <td className="table-cell text-white">{r.team?.name}</td>
                  <td className="table-cell text-gray-400">{r.tournament?.name || `#${r.tournament_id}`}</td>
                  <td className="table-cell">
                    <span className="badge-primary">{r.rank}.</span>
                  </td>
                  <td className="table-cell text-yellow-500 font-bold">{r.prize}</td>
                  <td className="table-cell">
                    {r.delivered_at ? (
                      <span className="badge-success">Teslim Edildi</span>
                    ) : r.approved_at ? (
                      <span className="badge-warning">Onaylandı</span>
                    ) : (
                      <span className="badge-warning">Beklemede</span>
                    )}
                  </td>
                  <td className="table-cell text-gray-400 text-xs">
                    {r.approved_at ? formatDate(r.approved_at) : '-'}
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-1">
                      {!r.approved_at && (
                        <button onClick={() => handleApprove(r.id)} className="p-1.5 text-green-400 hover:bg-green-500/20 rounded" title="Onayla">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {r.approved_at && !r.delivered_at && (
                        <button onClick={() => handleDeliver(r.id)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded" title="Teslim Edildi">
                          <Truck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rewards.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-8">Ödül bulunamadı.</p>
        )}
      </div>
    </div>
  );
}
