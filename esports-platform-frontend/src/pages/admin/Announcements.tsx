import { useState } from 'react';
import { Send, Megaphone, Bell, Loader2, X } from 'lucide-react';
import { adminService } from '../../services/admin';
import toast from 'react-hot-toast';

export default function AdminAnnouncements() {
  const [message, setMessage] = useState('');
  const [pin, setPin] = useState(false);
  const [sendingNote, setSendingNote] = useState(false);

  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [sendingNotif, setSendingNotif] = useState(false);

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSendingNote(true);
    try {
      await adminService.sendAnnouncement(message.trim(), pin);
      toast.success('Duyuru gönderildi.');
      setMessage('');
      setPin(false);
    } catch {
      toast.error('Duyuru gönderilemedi.');
    } finally {
      setSendingNote(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) return;
    setSendingNotif(true);
    try {
      await adminService.sendSystemNotification(notifTitle.trim(), notifBody.trim());
      toast.success('Bildirim gönderildi.');
      setNotifTitle('');
      setNotifBody('');
    } catch {
      toast.error('Bildirim gönderilemedi.');
    } finally {
      setSendingNotif(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Duyuru ve Bildirimler</h1>
        <p className="text-sm text-gray-400 mt-1">Tüm kullanıcılara duyuru ve bildirim gönderin</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Announcement */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">Genel Duyuru</h2>
              <p className="text-xs text-gray-500">Sohbet odalarına duuru gönder</p>
            </div>
          </div>

          <form onSubmit={handleSendAnnouncement} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mesaj</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field w-full"
                rows={4}
                placeholder="Duyuru mesajınız..."
                maxLength={1000}
              />
              <p className="text-xs text-gray-600 mt-1">{message.length}/1000</p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={pin} onChange={(e) => setPin(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-surface-400 text-valorant focus:ring-valorant" />
              <span className="text-sm text-gray-300">Mesajı sabitle</span>
            </label>
            <button type="submit" disabled={!message.trim() || sendingNote} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-30">
              {sendingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Gönder
            </button>
          </form>
        </div>

        {/* System Notification */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">Sistem Bildirimi</h2>
              <p className="text-xs text-gray-500">Tüm kullanıcılara bildirim gönder</p>
            </div>
          </div>

          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Başlık</label>
              <input type="text" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)}
                className="input-field w-full" placeholder="Bildirim başlığı..." maxLength={255} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mesaj</label>
              <textarea value={notifBody} onChange={(e) => setNotifBody(e.target.value)}
                className="input-field w-full" rows={3} placeholder="Bildirim mesajı..." maxLength={500} />
            </div>
            <button type="submit" disabled={!notifTitle.trim() || !notifBody.trim() || sendingNotif}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-30">
              {sendingNotif ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              Gönder
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
