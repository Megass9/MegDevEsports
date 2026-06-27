import { useEffect, useState } from 'react';
import { Search, Users, Ban, Shield, Trash2, Edit3, X, Loader2, CheckCircle, Save } from 'lucide-react';
import { adminService } from '../../services/admin';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [editModal, setEditModal] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRiotId, setEditRiotId] = useState('');
  const [saving, setSaving] = useState(false);

  const [roleModal, setRoleModal] = useState<any>(null);
  const [newRole, setNewRole] = useState('');

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    adminService.users(params)
      .then((res) => setUsers(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [roleFilter]);

  const handleBan = async (id: number, name: string) => {
    const reason = prompt(`${name} kullanıcısını banlama sebebi:`);
    if (!reason) return;
    try {
      await adminService.banUser(id, reason);
      toast.success('Kullanıcı banlandı.');
      load();
    } catch { toast.error('Hata oluştu.'); }
  };

  const handleUnban = async (id: number) => {
    try {
      await adminService.unbanUser(id);
      toast.success('Ban kaldırıldı.');
      load();
    } catch { toast.error('Hata oluştu.'); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`${name} kullanıcısını silmek istediğinize emin misiniz?`)) return;
    try {
      await adminService.deleteUser(id);
      toast.success('Kullanıcı silindi.');
      load();
    } catch { toast.error('Hata oluştu.'); }
  };

  const openEdit = (user: any) => {
    setEditModal(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRiotId(user.riot_id || '');
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal) return;
    setSaving(true);
    try {
      await adminService.updateUser(editModal.id, { name: editName, email: editEmail, riot_id: editRiotId });
      toast.success('Kullanıcı güncellendi.');
      setEditModal(null);
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hata oluştu.');
    } finally {
      setSaving(false);
    }
  };

  const openRoleModal = (user: any) => {
    setRoleModal(user);
    setNewRole(user.role);
  };

  const handleChangeRole = async () => {
    if (!roleModal || !newRole) return;
    try {
      await adminService.changeUserRole(roleModal.id, newRole);
      toast.success('Rol değiştirildi.');
      setRoleModal(null);
      load();
    } catch { toast.error('Hata oluştu.'); }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'bg-valorant/20 text-valorant',
      team_captain: 'bg-blue-500/20 text-blue-400',
      player: 'bg-green-500/20 text-green-400',
    };
    const labels: Record<string, string> = {
      admin: 'Admin',
      team_captain: 'Kaptan',
      player: 'Oyuncu',
    };
    return <span className={`${styles[role] || 'bg-gray-500/20 text-gray-400'} text-[10px] px-2 py-0.5 rounded-full font-medium`}>{labels[role] || role}</span>;
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Kullanıcı Yönetimi</h1>

      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
              className="input-field pl-10 w-full" placeholder="Kullanıcı ara..." />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="input-field sm:w-40">
            <option value="">Tümü</option>
            <option value="admin">Admin</option>
            <option value="team_captain">Kaptan</option>
            <option value="player">Oyuncu</option>
          </select>
        </div>
      </div>

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setEditModal(null)}>
          <div className="card max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-white">Kullanıcı Düzenle</h2>
              <button onClick={() => setEditModal(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Ad</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">E-posta</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="input-field w-full" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Riot ID</label>
                <input type="text" value={editRiotId} onChange={(e) => setEditRiotId(e.target.value)} className="input-field w-full" placeholder="ör: Oyuncu#TR1" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-30">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {roleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setRoleModal(null)}>
          <div className="card max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-white">Rol Değiştir</h2>
              <button onClick={() => setRoleModal(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-400 mb-4">{roleModal?.name} kullanıcısının yeni rolü:</p>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="input-field w-full mb-4">
              <option value="player">Oyuncu</option>
              <option value="team_captain">Takım Kaptanı</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRoleModal(null)} className="btn-secondary">Vazgeç</button>
              <button onClick={handleChangeRole} className="btn-primary">Değiştir</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-400">
                <th className="table-header">Kullanıcı</th>
                <th className="table-header">Rol</th>
                <th className="table-header">Durum</th>
                <th className="table-header">Riot ID</th>
                <th className="table-header">Kayıt</th>
                <th className="table-header text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-surface-400/50">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className="text-white text-sm font-medium">{user.name}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">{getRoleBadge(user.role)}</td>
                  <td className="table-cell">
                    {user.is_banned ? (
                      <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">Banlı</span>
                    ) : (
                      <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">Aktif</span>
                    )}
                  </td>
                  <td className="table-cell text-gray-400 text-sm">{user.riot_id || '-'}</td>
                  <td className="table-cell text-gray-400 text-xs">{formatDate(user.created_at)}</td>
                  <td className="table-cell text-right">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => openEdit(user)} className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-400 rounded-lg transition-colors" title="Düzenle">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => openRoleModal(user)} className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title="Rol Değiştir">
                        <Shield className="w-4 h-4" />
                      </button>
                      {user.is_banned ? (
                        <button onClick={() => handleUnban(user.id)} className="p-1.5 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors" title="Ban Kaldır">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleBan(user.id, user.name)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Banla">
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDelete(user.id, user.name)} className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors" title="Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
