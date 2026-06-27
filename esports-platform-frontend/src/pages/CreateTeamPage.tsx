import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Upload } from 'lucide-react';
import { teamService } from '../services/team';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function CreateTeamPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Takım adı zorunludur.');
      return;
    }
    setLoading(true);
    try {
      const res = await teamService.create({ name, description, game: 'valorant' });
      if (logo) {
        await teamService.uploadLogo(res.team.id, logo);
      }
      toast.success('Takım oluşturuldu!');
      navigate(`/teams/${res.team.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Oluşturma başarısız.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link to="/my-teams" className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        Takımlarıma Dön
      </Link>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-valorant/10 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-valorant" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Takım Oluştur</h1>
            <p className="text-sm text-gray-400">Yeni bir Valorant takımı kur</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="w-24 h-24 bg-surface-400 rounded-2xl flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="logo preview" className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-10 h-10 text-gray-600" />
              )}
            </div>
            <label className="btn-ghost text-xs cursor-pointer flex items-center gap-1">
              <Upload className="w-3 h-3" />
              Logo Seç
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Takım Adı *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Takımınızın adı"
              required
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Açıklama</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field min-h-[100px]"
              placeholder="Takımınız hakkında kısa bir açıklama..."
              maxLength={1000}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Oyun</label>
            <input
              type="text"
              value="Valorant"
              disabled
              className="input-field opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">Şu an sadece Valorant desteklenmektedir.</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Oluşturuluyor...' : 'Takım Oluştur'}
          </button>
        </form>
      </div>
    </div>
  );
}
