import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, Pin, Trash2, Image, Swords } from 'lucide-react';
import { chatService } from '../services/chat';
import type { ChatMessage } from '../types';
import { useAuthStore } from '../store/authStore';
import { formatTime } from '../utils/format';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pinned, setPinned] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeRoom, setActiveRoom] = useState<number | null>(null);
  const user = useAuthStore((s) => s.user);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    chatService.getRooms().then(setRooms).catch(() => {});
  }, []);

  useEffect(() => {
    if (!activeRoom) return;
    chatService.getMessages(activeRoom).then((data) => {
      setMessages(data.messages);
      setPinned(data.pinned);
    }).catch(() => {});
  }, [activeRoom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!newMessage.trim() && !attachment) return;
    if (!activeRoom) return;
    try {
      await chatService.send(activeRoom, newMessage, attachment || undefined);
      setNewMessage('');
      setAttachment(null);
      const data = await chatService.getMessages(activeRoom);
      setMessages(data.messages);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Mesaj gönderilemedi.');
    }
  };

  const handlePin = async (id: number) => {
    try {
      await chatService.pin(id);
      if (activeRoom) {
        const data = await chatService.getMessages(activeRoom);
        setPinned(data.pinned);
      }
      toast.success('Mesaj sabitlendi.');
    } catch {
      toast.error('İşlem başarısız.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await chatService.delete(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.success('Mesaj silindi.');
    } catch {
      toast.error('İşlem başarısız.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageCircle className="w-6 h-6 text-valorant" />
        <h1 className="section-title">Turnuva Sohbetleri</h1>
      </div>

      {rooms.length === 0 ? (
        <div className="card text-center py-12">
          <Swords className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Aktif bir turnuva sohbeti bulunmuyor. Bir turnuvaya katıldığında sohbet odası otomatik açılacak.</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar - Chat Rooms */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">Aktif Turnuvalar</p>
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                  activeRoom === room.id
                    ? 'bg-valorant/10 text-valorant border border-valorant/20'
                    : 'text-gray-400 hover:text-white hover:bg-surface-400'
                }`}
              >
                <div className="w-8 h-8 bg-surface-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Swords className="w-4 h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="font-medium truncate">{room.name}</p>
                  <p className="text-[10px] text-gray-500 truncate">{room.tournament?.status}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {!activeRoom ? (
              <div className="card h-[600px] flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Sohbet etmek için bir turnuva seçin</p>
                </div>
              </div>
            ) : (
              <div className="card h-[600px] flex flex-col">
                {/* Pinned */}
                {pinned.length > 0 && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-1 text-xs text-yellow-500 mb-2">
                      <Pin className="w-3 h-3" />
                      Sabitlenmiş
                    </div>
                    {pinned.map((p) => (
                      <p key={p.id} className="text-sm text-gray-300">{p.message}</p>
                    ))}
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="flex items-start gap-3 group">
                      <img
                        src={msg.user?.avatar_url}
                        alt={msg.user?.name}
                        className="w-8 h-8 rounded-full object-cover mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{msg.user?.name}</span>
                          <span className="text-[10px] text-gray-500">{formatTime(msg.created_at)}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-0.5">{msg.message}</p>
                        {msg.attachment && (
                          <img
                            src={`/storage/${msg.attachment}`}
                            alt="Attachment"
                            className="mt-2 max-w-xs rounded-lg"
                          />
                        )}
                      </div>
                      {user?.role === 'admin' && (
                        <div className="hidden group-hover:flex items-center gap-1">
                          <button onClick={() => handlePin(msg.id)} className="p-1 text-gray-500 hover:text-yellow-500">
                            <Pin className="w-3 h-3" />
                          </button>
                          <button onClick={() => handleDelete(msg.id)} className="p-1 text-gray-500 hover:text-red-400">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-surface-400 pt-4">
                  {attachment && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                      <Image className="w-3 h-3" />
                      {attachment.name}
                      <button onClick={() => setAttachment(null)} className="text-red-400">Kaldır</button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 text-gray-400 hover:text-white hover:bg-surface-400 rounded-lg transition-all"
                    >
                      <Image className="w-5 h-5" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                    />
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="input-field flex-1 min-h-[44px] max-h-[120px] resize-none"
                      placeholder="Mesajınızı yazın..."
                      rows={1}
                    />
                    <button onClick={handleSend} className="btn-primary px-4">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
