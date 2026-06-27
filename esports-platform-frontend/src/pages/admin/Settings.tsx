import { useEffect, useState } from 'react';
import { Settings2, Save, Plus, X, Loader2, Gamepad2 } from 'lucide-react';
import { adminService } from '../../services/admin';
import toast from 'react-hot-toast';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [siteName, setSiteName] = useState('');
  const [siteDesc, setSiteDesc] = useState('');
  const [maxTeamSize, setMaxTeamSize] = useState('7');
  const [minTeamSize, setMinTeamSize] = useState('5');
  const [maintenanceMode, setMaintenanceMode] = useState('false');
  const [games, setGames] = useState<string[]>(['valorant']);
  const [newGame, setNewGame] = useState('');

  useEffect(() => {
    Promise.all([
      adminService.getSettings(),
      adminService.getAvailableGames(),
    ]).then(([settingsRes, gamesRes]) => {
      const s = settingsRes.settings || {};
      const general = s.general || {};
      const system = s.system || {};
      setSiteName(general.site_name || '');
      setSiteDesc(general.site_description || '');
      setMaxTeamSize(general.max_team_size || '7');
      setMinTeamSize(general.min_team_size || '5');
      setMaintenanceMode(system.maintenance_mode || 'false');
      setGames(gamesRes.games || ['valorant']);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminService.updateSettings({
        site_name: siteName,
        site_description: siteDesc,
        max_team_size: maxTeamSize,
        min_team_size: minTeamSize,
        maintenance_mode: maintenanceMode,
      });
      toast.success('Ayarlar kaydedildi.');
    } catch {
      toast.error('Ayarlar kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddGame = async () => {
    if (!newGame.trim()) return;
    try {
      const res = await adminService.addGame(newGame.trim().toLowerCase());
      setGames(res.games || []);
      setNewGame('');
      toast.success('Oyun eklendi.');
    } catch {
      toast.error('Oyun eklenemedi.');
    }
  };

  const handleRemoveGame = async (game: string) => {
    if (game === 'valorant') {
      toast.error('Valorant varsayılan oyun, silinemez.');
      return;
    }
    try {
      const res = await adminService.removeGame(game);
      setGames(res.games || []);
      toast.success('Oyun kaldırıldı.');
    } catch {
      toast.error('Oyun kaldırılamadı.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-valorant animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white">Sistem Ayarları</h1>
        <p className="text-sm text-gray-400 mt-1">Site genel ayarlarını yönetin</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-surface-400 flex items-center justify-center">
              <Settings2 className="w-5 h-5 text-valorant" />
            </div>
            <h2 className="text-lg font-display font-bold text-white">Genel Ayarlar</h2>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Site Adı</label>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Site Açıklaması</label>
              <input type="text" value={siteDesc} onChange={(e) => setSiteDesc(e.target.value)} className="input-field w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Maks. Takım Boyutu</label>
                <input type="number" value={maxTeamSize} onChange={(e) => setMaxTeamSize(e.target.value)} className="input-field w-full" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Min. Takım Boyutu</label>
                <input type="number" value={minTeamSize} onChange={(e) => setMinTeamSize(e.target.value)} className="input-field w-full" min="1" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Bakım Modu</label>
              <select value={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.value)} className="input-field w-full">
                <option value="false">Kapalı</option>
                <option value="true">Açık</option>
              </select>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-30">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Kaydet
            </button>
          </form>
        </div>

        {/* Games */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-surface-400 flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-valorant" />
            </div>
            <h2 className="text-lg font-display font-bold text-white">Oyunlar</h2>
          </div>

          <div className="space-y-3 mb-6">
            {games.map((game) => (
              <div key={game} className="flex items-center justify-between bg-surface-400 rounded-lg px-4 py-3">
                <span className="text-sm text-white font-medium capitalize">{game}</span>
                <button onClick={() => handleRemoveGame(game)}
                  className="p-1 text-gray-500 hover:text-red-400 rounded disabled:opacity-30"
                  disabled={game === 'valorant'}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input type="text" value={newGame} onChange={(e) => setNewGame(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddGame())}
              className="input-field flex-1" placeholder="Yeni oyun ekle..." />
            <button onClick={handleAddGame} disabled={!newGame.trim()} className="btn-primary px-3 disabled:opacity-30">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
