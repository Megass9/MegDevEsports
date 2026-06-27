import { Link } from 'react-router-dom';
import { HelpCircle, FileVideo, MessageCircle, Shield, ChevronRight, Mail, Send, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supportService } from '../services/support';
import toast from 'react-hot-toast';

export default function SupportPage() {
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [userReply, setUserReply] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    supportService.list()
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoadingTickets(false));
  }, [sent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    setSending(true);
    try {
      await supportService.create({ subject, message, priority: 'normal' });
      setSent(true);
      toast.success('Destek talebiniz gönderildi!');
      setSubject('');
      setMessage('');
    } catch {
      toast.error('Gönderilemedi.');
    } finally {
      setSending(false);
    }
  };

  const handleUserReply = async () => {
    if (!userReply.trim() || !selectedTicket) return;
    setReplying(true);
    try {
      await supportService.reply(selectedTicket.id, userReply);
      toast.success('Cevabınız gönderildi!');
      const updated = await supportService.getById(selectedTicket.id);
      setSelectedTicket(updated);
      setUserReply('');
    } catch {
      toast.error('Gönderilemedi.');
    }
    setReplying(false);
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
          <p className="text-sm text-gray-400">Sıkça sorulan sorular ve yardım konuları</p>
        </div>
      </div>

      {/* Quick Links & Contact Form */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/replays" className="card card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <FileVideo className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Replay & Kanıt Yükleme</h3>
              <p className="text-xs text-gray-500">Maç videolarını ve screenshot kanıtlarını yükle</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-valorant mt-3">
            Sayfaya Git <ChevronRight className="w-3 h-3 ml-1" />
          </div>
        </Link>

        <Link to="/my-teams" className="card card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Takım Yönetimi</h3>
              <p className="text-xs text-gray-500">Takım kurma, davet etme ve üye yönetimi</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-valorant mt-3">
            Sayfaya Git <ChevronRight className="w-3 h-3 ml-1" />
          </div>
        </Link>

        <Link to="/matches" className="card card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Maç & Skor İtiraz</h3>
              <p className="text-xs text-gray-500">Maç sonuçlarına itiraz ve ihtilaf bildirme</p>
            </div>
          </div>
          <div className="flex items-center text-xs text-valorant mt-3">
            Sayfaya Git <ChevronRight className="w-3 h-3 ml-1" />
          </div>
        </Link>

        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">İletişim</h3>
              <p className="text-xs text-gray-500">Admin ile doğrudan iletişime geç</p>
            </div>
          </div>

          {sent ? (
            <div className="flex flex-col items-center py-4 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mb-2" />
              <p className="text-sm text-green-400 font-medium">Mesajınız iletildi!</p>
              <p className="text-xs text-gray-500 mt-1">Admin ekibi en kısa sürede cevaplayacaktır.</p>
              <button onClick={() => { setSent(false); setShowForm(false); }} className="btn-ghost text-xs mt-3">Yeni Mesaj</button>
            </div>
          ) : showForm ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Konu" className="input-field w-full text-sm" maxLength={255} required />
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mesajınız..." className="input-field w-full text-sm min-h-[100px]" maxLength={5000} required />
              <div className="flex gap-2">
                <button type="submit" disabled={sending} className="btn-primary flex-1 text-sm flex items-center justify-center gap-1">
                  <Send className="w-3 h-3" />{sending ? 'Gönderiliyor...' : 'Gönder'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost text-sm">İptal</button>
              </div>
            </form>
          ) : (
            <div>
              <p className="text-xs text-gray-600 mb-3">Sorun yaşarsan formu doldur, admin ekibimize ulaşsın.</p>
              <button onClick={() => setShowForm(true)} className="btn-primary text-xs w-full flex items-center justify-center gap-1">
                <Mail className="w-3 h-3" />Mesaj Gönder
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Previous Tickets */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare className="w-4 h-4 text-gray-400" />
          <h2 className="section-title mb-0">Geçmiş Taleplerin</h2>
        </div>

        {loadingTickets ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-valorant border-t-transparent rounded-full" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-gray-500">
            <Mail className="w-8 h-8 text-gray-600 mb-2" />
            <p className="text-sm">Henüz destek talebin yok.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tickets.map((ticket) => (
              <div key={ticket.id}>
                <button
                  onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
                  className="w-full flex items-center justify-between p-3 bg-surface-400 rounded-xl hover:bg-surface-300 transition-all text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ticket.status === 'open' ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                      {ticket.status === 'open' ? <Clock className="w-4 h-4 text-green-400" /> : <CheckCircle className="w-4 h-4 text-gray-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{ticket.subject}</p>
                      <p className="text-xs text-gray-500">{ticket.admin_reply ? 'Admin cevapladı' : 'Beklemede'} • {new Date(ticket.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${ticket.status === 'open' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {ticket.status === 'open' ? 'Açık' : 'Kapalı'}
                  </span>
                </button>

                {/* Expanded conversation */}
                {selectedTicket?.id === ticket.id && (
                  <div className="mt-2 ml-11 space-y-3">
                    <div className="bg-surface-500 rounded-lg p-3">
                      <p className="text-[10px] text-gray-500 mb-1">Senin mesajın</p>
                      <p className="text-sm text-white whitespace-pre-wrap">{ticket.message}</p>
                    </div>
                    {ticket.admin_reply && (
                      <div className="bg-valorant/10 border border-valorant/20 rounded-lg p-3">
                        <p className="text-[10px] text-valorant mb-1">Admin cevabı {ticket.replier?.name ? `(${ticket.replier.name})` : ''}</p>
                        <p className="text-sm text-white whitespace-pre-wrap">{ticket.admin_reply}</p>
                      </div>
                    )}
                    {ticket.user_reply && (
                      <div className="bg-surface-500 rounded-lg p-3">
                        <p className="text-[10px] text-gray-500 mb-1">Senin cevabın</p>
                        <p className="text-sm text-white whitespace-pre-wrap">{ticket.user_reply}</p>
                      </div>
                    )}
                    {ticket.status === 'open' && (
                      <div className="space-y-2">
                        <textarea
                          value={userReply}
                          onChange={(e) => setUserReply(e.target.value)}
                          placeholder="Admin'e cevap yaz..."
                          className="input-field w-full text-sm min-h-[80px]"
                          maxLength={5000}
                        />
                        <button
                          onClick={handleUserReply}
                          disabled={replying || !userReply.trim()}
                          className="btn-primary text-xs flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          {replying ? 'Gönderiliyor...' : 'Cevap Gönder'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="card">
        <h2 className="section-title mb-4">Sıkça Sorulan Sorular</h2>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Replay nasıl yüklerim?</h4>
            <p className="text-xs text-gray-500">Maç detay sayfasından "Sonuç Gönder" bölümünden screenshot yükleyebilirsin. Video kanıtları için Replay & Kanıt sayfasını kullan.</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Maç sonucuna nasıl itiraz ederim?</h4>
            <p className="text-xs text-gray-500">Maç detay sayfasında "İhtilaf Bildir" butonunu kullanarak itiraz oluşturabilirsin. Admin ekibi inceleyecektir.</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Takımdan nasıl ayrılırım?</h4>
            <p className="text-xs text-gray-500">Takımlarım sayfasından üyesi olduğun takımın yanındaki "Ayrıl" butonunu kullanabilirsin.</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Check-in nedir?</h4>
            <p className="text-xs text-gray-500">Turnuva başlamadan önce katılımını onaylamandır. Check-in yapmayan takımlar turnuvadan diskalifiye edilir.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
