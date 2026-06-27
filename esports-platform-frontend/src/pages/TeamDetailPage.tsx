import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Trophy, Swords, Shield, Star, UserPlus, Copy, Check, ExternalLink, MessageCircle, Send, Pin, Trash2, Upload } from 'lucide-react';
import { teamService } from '../services/team';
import { chatService } from '../services/chat';
import type { Team, ChatMessage } from '../types';
import { formatDate } from '../utils/format';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function TeamDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<number | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatPinned, setChatPinned] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((s) => s.user);

  const isMember = team?.members?.some((m) => m.id === user?.id) || team?.captain_id === user?.id;

  useEffect(() => {
    if (!chatRoomId) return;
    chatService.getMessages(chatRoomId).then((res) => {
      setChatMessages(res.messages);
      setChatPinned(res.pinned);
    }).catch(() => {});
  }, [chatRoomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    setUploadingLogo(true);
    try {
      const res = await teamService.uploadLogo(parseInt(id), file);
      setTeam((prev) => prev ? { ...prev, logo_url: res.logo_url } : prev);
      toast.success('Logo güncellendi!');
    } catch {
      toast.error('Logo yüklenemedi.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const loadChatRoom = async () => {
    if (!id) return;
    setChatLoading(true);
    try {
      const room = await chatService.getTeamRoom(parseInt(id));
      setChatRoomId(room.id);
    } catch {
      toast.error('Sohbet yüklenemedi.');
    } finally {
      setChatLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatRoomId || !chatInput.trim()) return;
    try {
      await chatService.send(chatRoomId, chatInput.trim());
      setChatInput('');
      const res = await chatService.getMessages(chatRoomId);
      setChatMessages(res.messages);
    } catch {
      toast.error('Mesaj gönderilemedi.');
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    teamService.getById(parseInt(id))
      .then(setTeam)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const copyCode = () => {
    if (team?.code) {
      navigator.clipboard.writeText(team.code);
      setCopied(true);
      toast.success('Takım kodu kopyalandı!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-valorant border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
        <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Takım bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 bg-surface-400 rounded-2xl flex items-center justify-center flex-shrink-0 relative group">
            {team.logo_url ? (
              <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <Shield className="w-12 h-12 text-valorant" />
            )}
            {isMember && (
              <>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadingLogo ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <Upload className="w-5 h-5 text-white" />
                  )}
                </button>
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-xs text-gray-500 uppercase mb-1">
              <Swords className="w-3 h-3" />
              {team.game}
            </div>
            <h1 className="text-3xl font-display font-bold text-white">{team.name}</h1>
            {team.description && (
              <p className="text-gray-400 mt-2">{team.description}</p>
            )}
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Kaptan: <span className="text-white">{team.captain?.name}</span></span>
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-sm text-valorant hover:text-accent-hover"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>{team.code}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-surface-400">
          <div>
            <div className="stat-value">{team.total_wins}</div>
            <div className="stat-label">Galibiyet</div>
          </div>
          <div>
            <div className="stat-value">{team.total_losses}</div>
            <div className="stat-label">Mağlubiyet</div>
          </div>
          <div>
            <div className="stat-value">%{team.win_rate}</div>
            <div className="stat-label">Kazanma Oranı</div>
          </div>
          <div>
            <div className="stat-value">{team.points}</div>
            <div className="stat-label">Puan</div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="card">
        <h2 className="section-title mb-4">Oyuncular</h2>
        <div className="space-y-3">
          {team.members?.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-3 bg-surface-400 rounded-lg">
              <div className="flex items-center gap-3">
                <img
                  src={member.avatar_url}
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-white">
                    {member.name}
                    {member.id === team.captain_id && (
                      <span className="ml-2 text-xs text-yellow-500">(Kaptan)</span>
                    )}
                  </p>
                  {member.pivot?.is_substitute && (
                    <span className="text-xs text-gray-500">Yedek</span>
                  )}
                </div>
              </div>
              {member.riot_id && (
                <span className="text-xs text-gray-500">{member.riot_id}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Match History */}
      {team.matches && team.matches.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">Maç Geçmişi</h2>
          <div className="space-y-3">
            {team.matches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-3 bg-surface-400 rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <span className={`w-2 h-2 rounded-full ${
                    match.winner_id === team.id ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-white">{match.team1?.name}</span>
                  <span className="text-xs text-gray-500">vs</span>
                  <span className="text-sm text-white">{match.team2?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {match.team1_score !== null && (
                    <span className="text-sm font-bold">{match.team1_score} - {match.team2_score}</span>
                  )}
                  {match.winner_id === team.id && (
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Chat */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">Takım Sohbeti</h2>
          {isMember && !chatRoomId && (
            <button onClick={loadChatRoom} disabled={chatLoading} className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
              <MessageCircle className="w-4 h-4" />
              Sohbete Katıl
            </button>
          )}
        </div>

        {!isMember && (
          <p className="text-sm text-gray-400">Sohbet sadece takım üyelerine açıktır.</p>
        )}

        {chatRoomId && (
          <div className="bg-surface-400 rounded-lg overflow-hidden">
            {/* Pinned */}
            {chatPinned.length > 0 && (
              <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 space-y-1">
                {chatPinned.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-2 text-xs text-yellow-400">
                    <Pin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span><strong>{msg.user.name}:</strong> {msg.message}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Messages */}
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-sm text-gray-500 text-center pt-8">Henüz mesaj yok.</p>
              )}
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <img src={msg.user.avatar_url} alt="" className="w-7 h-7 rounded-full mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{msg.user.name}</span>
                      <span className="text-[10px] text-gray-500">{formatDate(msg.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-300 break-words">{msg.message}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-surface-500 p-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                placeholder="Mesaj yaz..."
                className="input-field flex-1 py-2 text-sm"
              />
              <button onClick={sendChatMessage} className="btn-primary py-2 px-3">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
