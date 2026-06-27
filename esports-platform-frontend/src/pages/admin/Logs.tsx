import { useEffect, useState } from 'react';
import { ClipboardList, Search } from 'lucide-react';
import { adminService } from '../../services/admin';
import { formatDate } from '../../utils/format';

export default function AdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (actionFilter) params.action = actionFilter;
    adminService.getLogs(params)
      .then((res) => setLogs(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [actionFilter]);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Sistem Logları</h1>

      <div className="card mb-6">
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="input-field max-w-xs">
          <option value="">Tüm İşlemler</option>
          <option value="ban_user">Kullanıcı Banlama</option>
          <option value="unban_user">Ban Kaldırma</option>
          <option value="delete_user">Kullanıcı Silme</option>
          <option value="delete_team">Takım Silme</option>
          <option value="create_tournament">Turnuva Oluşturma</option>
          <option value="cancel_tournament">Turnuva İptal</option>
          <option value="start_tournament">Turnuva Başlatma</option>
          <option value="confirm_match">Maç Onaylama</option>
          <option value="create_reward">Ödül Ekleme</option>
          <option value="approve_reward">Ödül Onaylama</option>
          <option value="send_announcement">Duyuru</option>
          <option value="delete_chat_message">Mesaj Silme</option>
        </select>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-400">
                <th className="table-header">Admin</th>
                <th className="table-header">İşlem</th>
                <th className="table-header">Açıklama</th>
                <th className="table-header">IP</th>
                <th className="table-header">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-surface-400/50">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <img src={log.admin?.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-white text-sm">{log.admin?.name}</span>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="badge-primary text-[10px]">{log.action}</span>
                  </td>
                  <td className="table-cell text-gray-300 text-sm max-w-md truncate">{log.description}</td>
                  <td className="table-cell text-gray-500 text-xs">{log.ip_address || '-'}</td>
                  <td className="table-cell text-gray-400 text-xs">{formatDate(log.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {logs.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-8">Log bulunamadı.</p>
        )}
      </div>
    </div>
  );
}
