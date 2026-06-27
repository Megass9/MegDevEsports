import { useEffect, useState } from 'react';
import { Search, Shield, Users, Trash2, MessageCircle, Send, X, Loader2 } from 'lucide-react';
import { adminService } from '../../services/admin';
import { chatService } from '../../services/chat';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

export default function AdminTeams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [chatModal, setChatModal] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const load = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (search) params.search = search;
    adminService.teams(params)
      .then((res) => setTeams(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`${name} takımını silmek istediğinize emin misiniz?`)) return;
    try {
      await adminService.deleteTeam(id);
      toast.success('Takım silindi.');
      load();
    } catch { toast.error('İşlem başarısız.'); }
  };

  const openChat = async (team: any) => {
    setChatModal(team);
    setChatLoading(true);
    setChatMessages([]);
    try {
      const room = await chatService.getTeamRoom(team.id);
      const data = await chatService.getMessages(room.id);
      setChatMessages(data.messages || []);
    } catch {
      toast.error('Sohbet yüklenemedi.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const room = await chatService.getTeamRoom(chatModal.id);
      await chatService.send(room.id, newMessage.trim());
      setNewMessage('');
      const data = await chatService.getMessages(room.id);
      setChatMessages(data.messages || []);
    } catch {
      toast.error('Mesaj gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Takım Yönetimi</h1>

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            className="input-field pl-10"
            placeholder="Takım ara..."
          />
        </div>
      </div>

      {/* Teams Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-400">
                <th className="table-header">Takım</th>
                <th className="table-header">Kaptan</th>
                <th className="table-header">Üyeler</th>
                <th className="table-header">G/M</th>
                <th className="table-header">Puan</th>
                <th className="table-header">Oluşturma</th>
                <th className="table-header text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-400">
              {teams.map((team: any) => (
                <tr key={team.id} className="hover:bg-surface-400/50">
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-valorant" />
                      <span className="text-white">{team.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-gray-400">{team.captain?.name}</td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Users className="w-3 h-3" />
                      {team.members_count || 0}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-green-400">{team.total_wins}</span>
                    <span className="text-gray-500 mx-1">/</span>
                    <span className="text-red-400">{team.total_losses}</span>
                  </td>
                  <td className="table-cell text-yellow-500 font-bold">{team.points}</td>
                  <td className="table-cell text-gray-400">{formatDate(team.created_at)}</td>
                  <td className="table-cell text-right">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => openChat(team)}
                        className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                        title="Takım Sohbeti"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(team.id, team.name)}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
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

      {/* Team Chat Modal */}
      {chatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setChatModal(null)}>
          <div className="card max-w-lg w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-surface-400">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-valorant" />
                <div>
                  <h2 className="text-lg font-display font-bold text-white">{chatModal.name}</h2>
                  <p className="text-xs text-gray-500">Takım Sohbeti</p>
                </div>
              </div>
              <button onClick={() => setChatModal(null)} className="text-gray-400 hover:text-white p-1.5 hover:bg-surface-400 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-[300px] max-h-[400px]">
              {chatLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-valorant animate-spin" />
                </div>
              ) : chatMessages.length === 0 ? (
                <p className="text-center text-gray-500 text-sm py-8">Henüz mesaj yok.</p>
              ) : (
                chatMessages.map((msg: any) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-400 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                      {msg.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{msg.user?.name}</span>
                        <span className="text-[10px] text-gray-500">{formatDate(msg.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-300 mt-0.5 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="pt-4 border-t border-surface-400">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Mesaj yaz..."
                  className="input-field flex-1"
                  disabled={sending}
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="btn-primary px-4 disabled:opacity-30"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
