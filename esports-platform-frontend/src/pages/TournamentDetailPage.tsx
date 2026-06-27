import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Trophy, Users, Calendar, Clock, Swords, CheckCircle, XCircle, LogIn, LogOut, MessageCircle, Send, Image } from 'lucide-react';
import { tournamentService } from '../services/tournament';
import { teamService } from '../services/team';
import { chatService } from '../services/chat';
import { useAuthStore } from '../store/authStore';
import type { Tournament, Bracket, Team, ChatMessage } from '../types';
import { formatDate, formatTime, getStatusColor, getStatusLabel } from '../utils/format';
import BracketView from '../components/BracketView';
import toast from 'react-hot-toast';

export default function TournamentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTeams, setUserTeams] = useState<Team[]>([]);
  const [captainedTeams, setCaptainedTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [registering, setRegistering] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [chatRoom, setChatRoom] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatAttachment, setChatAttachment] = useState<File | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);

  const isRegistered = tournament?.participants?.some(
    (t) => userTeams.some((ut) => ut.id === t.id)
  );

  const canRegister = tournament?.status === 'registration' && isAuthenticated && captainedTeams.length > 0 && !isRegistered;

  const registeredTeamData = tournament?.participants?.find(
    (t) => userTeams.some((ut) => ut.id === t.id)
  );
  const isCheckedIn = !!(registeredTeamData as any)?.pivot?.checked_in_at;
  const canCheckIn = tournament?.status === 'registration' && isRegistered && !isCheckedIn;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    tournamentService.getById(parseInt(id))
      .then((data) => {
        setTournament(data.tournament);
        setBracket(data.bracket);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const rooms = tournament?.chat_rooms;
    if (rooms && rooms.length > 0) {
      setChatRoom(rooms[0]);
    }
  }, [tournament]);

  useEffect(() => {
    if (!chatRoom?.id) return;
    chatService.getMessages(chatRoom.id).then((res) => {
      setChatMessages(res.messages);
    }).catch(() => {});
  }, [chatRoom?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendChat = async () => {
    if (!chatRoom?.id || (!chatInput.trim() && !chatAttachment)) return;
    try {
      await chatService.send(chatRoom.id, chatInput.trim(), chatAttachment || undefined);
      setChatInput('');
      setChatAttachment(null);
      const res = await chatService.getMessages(chatRoom.id);
      setChatMessages(res.messages);
    } catch {
      toast.error('Mesaj gönderilemedi.');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      teamService.myTeams().then((res: any) => {
        const captains = res.captained_teams || [];
        const members = res.member_teams || [];
        setCaptainedTeams(captains);
        setUserTeams([...captains, ...members]);
        if (captains.length === 1) {
          setSelectedTeamId(captains[0].id);
        }
      }).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleRegister = async () => {
    if (!tournament || !selectedTeamId) return;
    setRegistering(true);
    try {
      await tournamentService.register({ tournament_id: tournament.id, team_id: selectedTeamId });
      const data = await tournamentService.getById(tournament.id);
      setTournament(data.tournament);
    } catch {
      alert('Kayıt yapılamadı.');
    } finally {
      setRegistering(false);
    }
  };

  const handleCheckIn = async () => {
    if (!tournament || !registeredTeamData) return;
    setCheckingIn(true);
    try {
      await tournamentService.checkIn(tournament.id, registeredTeamData.id);
      const data = await tournamentService.getById(tournament.id);
      setTournament(data.tournament);
      toast.success('Check-in başarıyla yapıldı!');
    } catch {
      toast.error('Check-in yapılamadı.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleUnregister = async () => {
    if (!tournament) return;
    const registeredTeam = tournament.participants?.find(
      (t) => userTeams.some((ut) => ut.id === t.id)
    );
    if (!registeredTeam) return;
    setRegistering(true);
    try {
      await tournamentService.unregister(tournament.id, registeredTeam.id);
      const data = await tournamentService.getById(tournament.id);
      setTournament(data.tournament);
    } catch {
      alert('Kayıt iptal edilemedi.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-valorant border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 text-center">
        <Swords className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Turnuva bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`${getStatusColor(tournament.status)}`}>
                {getStatusLabel(tournament.status)}
              </span>
              <span className="text-xs text-gray-500 uppercase">{tournament.game}</span>
            </div>
            <h1 className="text-3xl font-display font-bold text-white">{tournament.name}</h1>
            {tournament.description && (
              <p className="text-gray-400 mt-2">{tournament.description}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            {tournament.prize_pool > 0 && (
              <div className="text-right">
                <div className="text-2xl font-display font-bold text-yellow-500">
                  {tournament.prize_pool} TL
                </div>
                <div className="text-sm text-gray-400">Ödül Havuzu</div>
              </div>
            )}
            {canRegister && (
              <div className="flex items-center gap-2">
                {captainedTeams.length > 1 && (
                  <select
                    value={selectedTeamId ?? ''}
                    onChange={(e) => setSelectedTeamId(Number(e.target.value))}
                    className="input-field text-sm py-2 w-40"
                  >
                    {captainedTeams.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                )}
                <button onClick={handleRegister} disabled={registering || !selectedTeamId} className="btn-primary flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  {registering ? 'Kaydediliyor...' : 'Turnuvaya Katıl'}
                </button>
              </div>
            )}
            {isRegistered && tournament.status === 'registration' && (
              <div className="flex items-center gap-2">
                {canCheckIn ? (
                  <button onClick={handleCheckIn} disabled={checkingIn} className="btn-primary flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {checkingIn ? 'Check-in yapılıyor...' : 'Check-in Yap'}
                  </button>
                ) : isCheckedIn ? (
                  <span className="flex items-center gap-2 text-sm text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    Check-in Yapıldı
                  </span>
                ) : null}
                <button onClick={handleUnregister} disabled={registering} className="btn-danger flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  {registering ? 'İptal ediliyor...' : 'Kaydı İptal Et'}
                </button>
              </div>
            )}
            {tournament.status === 'registration' && isAuthenticated && captainedTeams.length === 0 && userTeams.length > 0 && (
              <p className="text-sm text-gray-400">Kayıt olmak için takım kaptanı olmalısınız.</p>
            )}
            {tournament.status === 'registration' && isAuthenticated && userTeams.length === 0 && (
              <button onClick={() => navigate('/teams/create')} className="btn-secondary flex items-center gap-2">
                <Users className="w-4 h-4" />
                Takım Oluştur
              </button>
            )}
            {tournament.status === 'registration' && !isAuthenticated && (
              <button onClick={() => navigate('/login')} className="btn-primary flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Giriş Yap
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Participants */}
      {tournament.participants && tournament.participants.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">Katılımcı Takımlar</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {tournament.participants.map((team) => {
              const pivot = (team as any).pivot || {};
              const checkedIn = !!pivot.checked_in_at;
              const disqualified = !!pivot.disqualified;
              return (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="flex items-center gap-3 p-3 bg-surface-400 rounded-lg hover:bg-surface-300 transition-colors"
                >
                  <div className="w-10 h-10 bg-surface-500 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-valorant" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{team.name}</p>
                    <p className="text-xs text-gray-500">{team.captain?.name}</p>
                  </div>
                  {tournament.status === 'in_progress' && disqualified && (
                    <span className="text-xs text-red-400">Diskalifiye</span>
                  )}
                  {checkedIn && tournament.status !== 'completed' && (
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Bracket */}
      {bracket && bracket.rounds && (
        <div className="card">
          <h2 className="section-title mb-6">Turnuva Bracketi</h2>
          <BracketView bracket={bracket} tournamentId={tournament.id} />
        </div>
      )}

      {/* Matches List */}
      {tournament.matches && tournament.matches.length > 0 && (
        <div className="card">
          <h2 className="section-title mb-4">Maçlar</h2>
          <div className="space-y-3">
            {tournament.matches.map((match) => (
              <div key={match.id} className="flex items-center justify-between p-4 bg-surface-400 rounded-lg">
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-xs text-gray-500 w-16">R{match.round}</span>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium text-white w-32 truncate">
                      {match.team1?.name || 'TBD'}
                    </span>
                    <span className="text-sm text-gray-500">vs</span>
                    <span className="text-sm font-medium text-white w-32 truncate">
                      {match.team2?.name || 'TBD'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {match.team1_score !== null && (
                    <span className="text-sm font-bold text-white">
                      {match.team1_score} - {match.team2_score}
                    </span>
                  )}
                  <span className={`${getStatusColor(match.status)} text-xs`}>
                    {getStatusLabel(match.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tournament Chat */}
      {chatRoom && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-valorant" />
            <h2 className="section-title mb-0">Turnuva Sohbeti</h2>
          </div>
          <div className="bg-surface-400 rounded-lg overflow-hidden">
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <p className="text-sm text-gray-500 text-center pt-8">Henüz mesaj yok.</p>
              )}
              {chatMessages.map((msg) => (
                <div key={msg.id} className="flex items-start gap-3">
                  <img src={msg.user?.avatar_url} alt="" className="w-7 h-7 rounded-full mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{msg.user?.name}</span>
                      <span className="text-[10px] text-gray-500">{formatTime(msg.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-300 break-words">{msg.message}</p>
                    {msg.attachment && (
                      <img
                        src={`/storage/${msg.attachment}`}
                        alt="screenshot"
                        className="mt-2 max-w-xs rounded-lg cursor-pointer"
                        onClick={() => window.open(`/storage/${msg.attachment}`, '_blank')}
                      />
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            {isAuthenticated && (
              <div className="border-t border-surface-500 p-3">
                {chatAttachment && (
                  <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                    <Image className="w-3 h-3" />
                    {chatAttachment.name}
                    <button onClick={() => setChatAttachment(null)} className="text-red-400">Kaldır</button>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => chatFileRef.current?.click()} className="p-2 text-gray-400 hover:text-white hover:bg-surface-500 rounded-lg">
                    <Image className="w-4 h-4" />
                  </button>
                  <input type="file" ref={chatFileRef} onChange={(e) => setChatAttachment(e.target.files?.[0] || null)} className="hidden" accept="image/*" />
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Mesaj yaz..."
                    className="input-field flex-1 py-2 text-sm"
                  />
                  <button onClick={sendChat} className="btn-primary py-2 px-3">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
