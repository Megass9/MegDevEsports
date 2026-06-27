import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, Filter, Plus, X, UserPlus, UserCheck, Gamepad2,
  Shield, ChevronDown, ChevronRight, MessageCircle, Clock, MapPin,
  Star, CheckCircle, Trash2, ToggleLeft, ToggleRight
} from 'lucide-react';
import { lfgService } from '../services/lfg';
import { useAuthStore } from '../store/authStore';
import { formatDate } from '../utils/format';
import toast from 'react-hot-toast';

const TYPE_LABELS: Record<string, string> = {
  looking_team: 'Takım Arıyor',
  looking_player: 'Oyuncu Arıyor',
};

const TYPE_ICONS: Record<string, any> = {
  looking_team: UserCheck,
  looking_player: UserPlus,
};

export default function LFGPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>(null);

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterGame, setFilterGame] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterRank, setFilterRank] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [formType, setFormType] = useState('looking_team');
  const [formGame, setFormGame] = useState('valorant');
  const [formRole, setFormRole] = useState('');
  const [formRank, setFormRank] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formContact, setFormContact] = useState('');

  // My posts
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [showMyPosts, setShowMyPosts] = useState(false);

  const loadPosts = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filterType) params.type = filterType;
    if (filterGame) params.game = filterGame;
    if (filterRole) params.filterRole = filterRole;
    if (filterRank) params.rank = filterRank;
    lfgService.list(params)
      .then((res) => setPosts(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const loadMyPosts = () => {
    if (!isAuthenticated) return;
    lfgService.myPosts().then(setMyPosts).catch(() => {});
  };

  useEffect(() => {
    lfgService.filters().then(setFilters).catch(() => {});
    loadPosts();
  }, []);

  useEffect(() => {
    loadPosts();
  }, [filterType, filterGame, filterRole, filterRank]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await lfgService.create({ type: formType, game: formGame, role: formRole, rank: formRank, description: formDesc, contact_info: formContact });
      toast.success('İlan yayınlandı!');
      setShowCreate(false);
      setFormType('looking_team'); setFormGame('valorant'); setFormRole(''); setFormRank(''); setFormDesc(''); setFormContact('');
      loadPosts();
      loadMyPosts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Hata oluştu.');
    }
  };

  const handleToggle = async (id: number) => {
    try {
      await lfgService.toggle(id);
      loadMyPosts();
      loadPosts();
    } catch { toast.error('Hata oluştu.'); }
  };

  const handleDelete = async (id: number) => {
    try {
      await lfgService.delete(id);
      toast.success('İlan silindi.');
      loadMyPosts();
      loadPosts();
    } catch { toast.error('Hata oluştu.'); }
  };

  const TypeIcon = (type: string) => TYPE_ICONS[type] || Users;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-valorant/10 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-valorant" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Oyuncu Aranıyor</h1>
            <p className="text-sm text-gray-500">Takım arayan oyuncular ve oyuncu arayan takımlar</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isAuthenticated && (
            <>
              <button onClick={() => { loadMyPosts(); setShowMyPosts(!showMyPosts); }} className="btn-ghost text-sm flex items-center gap-1">
                <UserCheck className="w-4 h-4" />
                {showMyPosts ? 'Tüm İlanlar' : 'İlanlarım'}
              </button>
              <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-1">
                <Plus className="w-4 h-4" />
                İlan Ver
              </button>
            </>
          )}
        </div>
      </div>

      {/* My Posts */}
      {showMyPosts && (
        <div className="card">
          <h2 className="section-title mb-4">İlanlarım</h2>
          {myPosts.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Henüz ilan vermedin.</p>
          ) : (
            <div className="space-y-3">
              {myPosts.map((post: any) => {
                const Icon = TYPE_ICONS[post.type] || Users;
                return (
                  <div key={post.id} className="flex items-center gap-4 p-4 bg-surface-400 rounded-xl">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${post.is_active ? 'bg-green-500/10' : 'bg-gray-500/10'}`}>
                      <Icon className={`w-5 h-5 ${post.is_active ? 'text-green-400' : 'text-gray-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-white">{post.description?.slice(0, 60)}</p>
                        {post.is_active ? (
                          <span className="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">Aktif</span>
                        ) : (
                          <span className="text-[10px] text-gray-500 bg-gray-500/10 px-1.5 py-0.5 rounded">Pasif</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">{post.game} • {post.role || '-'} • {post.rank || '-'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggle(post.id)} className="p-1.5 text-gray-500 hover:text-yellow-400 rounded-lg hover:bg-surface-300" title={post.is_active ? 'Pasif Yap' : 'Aktif Yap'}>
                        {post.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(post.id)} className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-surface-300" title="Sil">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <button onClick={() => setShowFilters(!showFilters)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-300">Filtrele</span>
            {(filterType || filterGame || filterRole || filterRank) && (
              <span className="text-[10px] text-valorant bg-valorant/10 px-2 py-0.5 rounded-full">Filtre var</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-surface-400">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="input-field text-sm">
              <option value="">Tümü</option>
              <option value="looking_team">Takım Arıyor</option>
              <option value="looking_player">Oyuncu Arıyor</option>
            </select>
            <select value={filterGame} onChange={(e) => setFilterGame(e.target.value)} className="input-field text-sm">
              <option value="">Tüm Oyunlar</option>
              {filters?.games?.map((g: string) => <option key={g} value={g}>{g.toUpperCase()}</option>)}
            </select>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="input-field text-sm">
              <option value="">Tüm Roller</option>
              {filters?.roles?.map((r: string) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={filterRank} onChange={(e) => setFilterRank(e.target.value)} className="input-field text-sm">
              <option value="">Tüm Ranklar</option>
              {filters?.ranks?.map((r: string) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={() => { setFilterType(''); setFilterGame(''); setFilterRole(''); setFilterRank(''); }} className="btn-ghost text-xs col-span-full">
              Filtreleri Temizle
            </button>
          </div>
        )}
      </div>

      {/* Posts */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin w-8 h-8 border-2 border-valorant border-t-transparent rounded-full" />
        </div>
      ) : posts.length === 0 ? (
        <div className="card text-center py-16">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Henüz ilan bulunmuyor.</p>
          {isAuthenticated ? (
            <button onClick={() => setShowCreate(true)} className="btn-primary mt-4 text-sm">İlk İlanı Sen Ver</button>
          ) : (
            <Link to="/register" className="btn-primary mt-4 text-sm">Giriş Yap & İlan Ver</Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {posts.map((post: any) => {
            const Icon = TYPE_ICONS[post.type] || Users;
            return (
              <div key={post.id} className="card card-hover group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-valorant/5 to-transparent rounded-bl-full" />
                <div className="flex items-start gap-4 relative">
                  <div className="w-12 h-12 bg-surface-400 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-valorant" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-valorant/10 text-valorant text-[10px] font-medium rounded-full">
                        {TYPE_LABELS[post.type] || post.type}
                      </span>
                      <span className="text-xs text-gray-500">• {post.game?.toUpperCase()}</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed mb-3">{post.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      {post.role && (
                        <span className="flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          {post.role}
                        </span>
                      )}
                      {post.rank && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {post.rank}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-400">
                  <div className="flex items-center gap-2">
                    <img src={post.user?.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                    <span className="text-xs text-gray-400">{post.user?.name}</span>
                  </div>
                  {post.contact_info && (
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {post.contact_info}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowCreate(false)}>
          <div className="card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-white">İlan Ver</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setFormType('looking_team')}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${formType === 'looking_team' ? 'bg-valorant/15 text-valorant border border-valorant/30' : 'bg-surface-400 text-gray-400 border border-transparent hover:bg-surface-300'}`}>
                  <UserCheck className="w-5 h-5 mx-auto mb-1" />
                  Takım Arıyorum
                </button>
                <button type="button" onClick={() => setFormType('looking_player')}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${formType === 'looking_player' ? 'bg-valorant/15 text-valorant border border-valorant/30' : 'bg-surface-400 text-gray-400 border border-transparent hover:bg-surface-300'}`}>
                  <UserPlus className="w-5 h-5 mx-auto mb-1" />
                  Oyuncu Arıyorum
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Oyun</label>
                  <select value={formGame} onChange={(e) => setFormGame(e.target.value)} className="input-field w-full text-sm">
                    {filters?.games?.map((g: string) => <option key={g} value={g}>{g.toUpperCase()}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Rol</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)} className="input-field w-full text-sm">
                    <option value="">Seçilmedi</option>
                    {filters?.roles?.map((r: string) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Rank</label>
                  <select value={formRank} onChange={(e) => setFormRank(e.target.value)} className="input-field w-full text-sm">
                    <option value="">Seçilmedi</option>
                    {filters?.ranks?.map((r: string) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Açıklama</label>
                <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="input-field w-full text-sm" rows={3} placeholder="Kendini veya aradığın oyuncuyu tanıt..." required maxLength={500} />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">İletişim (opsiyonel)</label>
                <input type="text" value={formContact} onChange={(e) => setFormContact(e.target.value)} className="input-field w-full text-sm" placeholder="Discord, Riot ID, vs..." />
              </div>
              <button type="submit" className="btn-primary w-full">Yayınla</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
