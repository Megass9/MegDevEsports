import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Trash2, Pin, Swords, Send, Loader2 } from 'lucide-react';
import { chatService } from '../../services/chat';
import { adminService } from '../../services/admin';
import { formatDate } from '../../utils/format';
import toast from 'react-hot-toast';

export default function AdminChat() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatService.getRooms().then(setRooms).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    chatService.getMessages(activeRoom).then((data) => setMessages(data.messages)).catch(() => {});
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleDelete = async (id: number) => {
    try {
      await chatService.delete(id);
      setMessages((prev) => prev.filter((m: any) => m.id !== id));
      toast.success('Mesaj silindi.');
    } catch { toast.error('Hata oluştu.'); }
  };

  const handlePin = async (id: number) => {
    try {
      await chatService.pin(id);
      toast.success('Mesaj sabitlendi.');
    } catch { toast.error('Hata oluştu.'); }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !activeRoom) return;
    setSending(true);
    try {
      await chatService.send(activeRoom, newMessage.trim());
      setNewMessage('');
      const data = await chatService.getMessages(activeRoom);
      setMessages(data.messages || []);
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

  const activeRoomData = rooms.find((r) => r.id === activeRoom);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Sohbet Yönetimi</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Rooms */}
        <div className="lg:col-span-1 space-y-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                activeRoom === room.id ? 'bg-valorant/10 text-valorant' : 'text-gray-400 hover:text-white hover:bg-surface-400'
              }`}
            >
              <Swords className="w-4 h-4" />
              <div className="text-left min-w-0">
                <p className="truncate">{room.name}</p>
                <p className="text-[10px] text-gray-500">{room.tournament?.status}</p>
              </div>
            </button>
          ))}
          {rooms.length === 0 && (
            <p className="text-gray-500 text-sm">Aktif oda yok.</p>
          )}
        </div>

        {/* Messages */}
        <div className="lg:col-span-3 card flex flex-col">
          {!activeRoom ? (
            <p className="text-center text-gray-500 py-8">Bir oda seçin</p>
          ) : (
            <>
              {/* Room Header */}
              <div className="pb-4 mb-4 border-b border-surface-400">
                <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-valorant" />
                  {activeRoomData?.name || 'Sohbet'}
                </h3>
              </div>

              {/* Messages List */}
              <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[500px]">
                {messages.map((msg: any) => (
                  <div key={msg.id} className="flex items-start gap-3 p-3 bg-surface-400 rounded-lg group">
                    <div className="w-8 h-8 rounded-full bg-surface-300 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0">
                      {msg.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{msg.user?.name}</span>
                        <span className="text-[10px] text-gray-500">{formatDate(msg.created_at)}</span>
                      </div>
                      <p className="text-sm text-gray-300 mt-0.5 whitespace-pre-wrap">{msg.message}</p>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1 ml-2 flex-shrink-0">
                      <button onClick={() => handlePin(msg.id)} className="p-1.5 text-gray-500 hover:text-yellow-500 rounded">
                        <Pin className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleDelete(msg.id)} className="p-1.5 text-gray-500 hover:text-red-400 rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-gray-500 py-8">Bu odada mesaj yok.</p>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Send Message */}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
