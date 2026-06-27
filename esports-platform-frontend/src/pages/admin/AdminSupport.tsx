import { useEffect, useState } from 'react';
import { Mail, Send, CheckCircle, X, Clock, ChevronDown } from 'lucide-react';
import { adminService } from '../../services/admin';
import toast from 'react-hot-toast';

export default function AdminSupport() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter) params.status = filter;
      const res = await adminService.getSupportTickets(params);
      setTickets(res.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const openTicket = async (id: number) => {
    try {
      const ticket = await adminService.getSupportTicket(id);
      setSelected(ticket);
      setReplyText(ticket.admin_reply || '');
    } catch { toast.error('Yüklenemedi.'); }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selected) return;
    setSending(true);
    try {
      await adminService.replySupportTicket(selected.id, replyText);
      toast.success('Cevap gönderildi.');
      setSelected(null);
      load();
    } catch { toast.error('Gönderilemedi.'); }
    setSending(false);
  };

  const closeTicket = async (id: number) => {
    try {
      await adminService.closeSupportTicket(id);
      toast.success('Talep kapatıldı.');
      setSelected(null);
      load();
    } catch { toast.error('Hata oluştu.'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">Destek Talepleri</h1>
            <p className="text-sm text-gray-400">Kullanıcılardan gelen mesajlar</p>
          </div>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field text-sm w-32">
          <option value="">Tümü</option>
          <option value="open">Açık</option>
          <option value="closed">Kapalı</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-valorant border-t-transparent rounded-full" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="card flex flex-col items-center py-12">
          <Mail className="w-12 h-12 text-gray-600 mb-3" />
          <p className="text-gray-400">Henüz destek talebi yok.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => openTicket(ticket.id)}
              className="card cursor-pointer hover:border-valorant/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    ticket.status === 'open' ? 'bg-green-500/10' : 'bg-gray-500/10'
                  }`}>
                    {ticket.status === 'open' ? (
                      <Clock className="w-4 h-4 text-green-400" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ticket.subject}</p>
                    <p className="text-xs text-gray-500 truncate">{ticket.user?.name} • {ticket.created_at}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  ticket.status === 'open' ? 'bg-green-500/20 text-green-400' :
                  ticket.status === 'closed' ? 'bg-gray-500/20 text-gray-400' : ''
                }`}>
                  {ticket.status === 'open' ? 'Açık' : 'Kapalı'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelected(null)}>
          <div className="card max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-white">Destek Talebi</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-gray-500">Konu</p>
                <p className="text-sm text-white font-medium">{selected.subject}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Gönderen</p>
                <p className="text-sm text-white">{selected.user?.name} ({selected.user?.email})</p>
              </div>
              <div className="bg-surface-400 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Mesaj</p>
                <p className="text-sm text-white whitespace-pre-wrap">{selected.message}</p>
              </div>
              {selected.admin_reply && (
                <div className="bg-valorant/10 border border-valorant/20 rounded-lg p-4">
                  <p className="text-xs text-valorant mb-2">Admin Cevabı</p>
                  <p className="text-sm text-white whitespace-pre-wrap">{selected.admin_reply}</p>
                  <p className="text-xs text-gray-500 mt-2">{selected.replier?.name} tarafından</p>
                </div>
              )}
              {selected.user_reply && (
                <div className="bg-surface-400 rounded-lg p-4">
                  <p className="text-xs text-gray-500 mb-2">Kullanıcı Cevabı</p>
                  <p className="text-sm text-white whitespace-pre-wrap">{selected.user_reply}</p>
                </div>
              )}
            </div>

            {selected.status === 'open' && (
              <form onSubmit={handleReply} className="space-y-3">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Cevabınız..."
                  className="input-field w-full text-sm min-h-[120px]"
                  required
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={sending} className="btn-primary flex-1 text-sm flex items-center justify-center gap-1">
                    <Send className="w-3 h-3" />
                    {sending ? 'Gönderiliyor...' : 'Cevapla'}
                  </button>
                  <button type="button" onClick={() => closeTicket(selected.id)} className="btn-ghost text-sm">Talebi Kapat</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
