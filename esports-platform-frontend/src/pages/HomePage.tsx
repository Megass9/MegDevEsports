import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trophy, Users, Swords, TrendingUp, ArrowRight, Calendar, Medal, Shield, Zap, Sparkles, Gamepad2, CheckCircle, Flame, MessageCircle } from 'lucide-react';
import { tournamentService, homeService } from '../services/tournament';
import { useAuthStore } from '../store/authStore';
import type { Tournament } from '../types';
import { formatDate, getStatusColor, getStatusLabel } from '../utils/format';

export default function HomePage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [stats, setStats] = useState({ active_tournaments: 0, total_teams: 0, completed_tournaments: 0, total_users: 0 });
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    tournamentService.getActive().then(setTournaments).catch(() => {});
    homeService.stats().then(setStats).catch(() => {});
  }, []);

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-500 via-surface-600 to-surface-500">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-valorant/15 via-purple-900/5 to-transparent" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-valorant/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-28 md:py-36 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-valorant/10 border border-valorant/20 rounded-full text-valorant text-xs font-medium mb-8">
              <Zap className="w-3 h-3" />
              Turnuva Platformu
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black mb-6 leading-tight">
              <span className="gradient-text">MEG</span>
              <br />
              <span className="text-white">DEV</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Profesyonel turnuvalara katıl, takımını kur ve rakiplerini yenerek zirveye yüksel!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/tournaments" className="btn-primary text-lg px-8 py-3.5 group">
                Turnuvaları Keşfet
                <ArrowRight className="w-5 h-5 ml-2 inline group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/register" className="btn-secondary text-lg px-8 py-3.5">
                Hemen Katıl
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Swords, label: 'Aktif Turnuva', value: stats.active_tournaments, color: 'text-blue-400' },
            { icon: Users, label: 'Takımlar', value: stats.total_teams, color: 'text-green-400' },
            { icon: Trophy, label: 'Tamamlanan', value: stats.completed_tournaments, color: 'text-yellow-400' },
            { icon: Flame, label: 'Oyuncular', value: stats.total_users, color: 'text-orange-400' },
          ].map((stat, i) => (
            <div key={i} className="card card-hover text-center group">
              <div className="w-12 h-12 bg-surface-400 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-valorant/10 transition-colors">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="stat-value text-3xl">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Active Tournaments */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="section-title mb-1">Aktif Turnuvalar</h2>
            <p className="text-sm text-gray-500">Şu an devam eden ve kayıt açık turnuvalar</p>
          </div>
          <Link to="/tournaments" className="btn-ghost text-sm flex items-center gap-1">
            Tümünü Gör <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {tournaments.length === 0 ? (
          <div className="card text-center py-16">
            <Swords className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Şu an aktif turnuva bulunmuyor.</p>
            <p className="text-sm text-gray-500 mt-2">Yakında yeni turnuvalar eklenecek.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.slice(0, 6).map((t) => (
              <Link key={t.id} to={`/tournaments/${t.id}`} className="card card-hover group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-valorant/5 to-transparent rounded-bl-full" />
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Gamepad2 className="w-3 h-3" />
                    {t.game}
                  </span>
                  <span className={`${getStatusColor(t.status)} text-xs px-2 py-1 rounded-full`}>
                    {getStatusLabel(t.status)}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-valorant transition-colors">
                  {t.name}
                </h3>

                <p className="text-sm text-gray-400 mb-5 line-clamp-2 leading-relaxed">{t.description}</p>

                <div className="flex items-center justify-between text-sm pt-3 border-t border-surface-400">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Users className="w-4 h-4" />
                    <span className={(t.participants_count || 0) >= t.max_teams ? 'text-green-400' : 'text-gray-300'}>
                      {t.participants_count || 0}/{t.max_teams}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(t.start_date)}</span>
                  </div>
                  {t.prize_pool > 0 && (
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Trophy className="w-3.5 h-3.5" />
                      <span className="text-xs">{t.prize_pool.toLocaleString()} TL</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="relative overflow-hidden bg-gradient-to-b from-surface-600 to-surface-500 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-valorant/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-valorant/10 border border-valorant/20 rounded-full text-valorant text-xs font-medium mb-4">
              <Sparkles className="w-3 h-3" />
              Özellikler
            </div>
            <h2 className="section-title text-center mb-2">Neden Meg Dev?</h2>
            <p className="text-gray-500 text-sm">Rekabetçi oyuncular için tasarlanmış kapsamlı platform</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Medal, title: 'Rekabetçi Turnuvalar', desc: 'Profesyonel turnuva sistemi, otomatik bracket oluşturma ve canlı skor takibi ile en iyi takımlarla rekabet edin.' },
              { icon: Shield, title: 'Takım Yönetimi', desc: 'Kolay takım oluşturma, davet sistemi, kaptanlık devri ve detaylı takım istatistikleri.' },
              { icon: TrendingUp, title: 'Gerçek Zamanlı Sıralama', desc: 'Sezonluk ve global sıralama, detaylı istatistikler ve performans takibi ile kendinizi geliştirin.' },
              { icon: MessageCircle, title: 'Entegre Sohbet', desc: 'Turnuva ve takım odalarında anlık mesajlaşma, duyuru sistemi ve bildirimler.' },
              { icon: CheckCircle, title: 'Adil Oyun', desc: 'Maç sonucu onay sistemi, ihtilaf çözme mekanizması ve admin denetimi ile adil rekabet.' },
              { icon: Zap, title: 'Hızlı ve Modern', desc: 'Modern arayüz, mobil uyumlu tasarım ve kesintisiz oyun deneyimi.' },
            ].map((f, i) => (
              <div key={i} className="card card-hover group">
                <div className="w-12 h-12 bg-valorant/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-valorant/20 transition-colors">
                  <f.icon className="w-6 h-6 text-valorant" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="card bg-gradient-to-br from-valorant/10 to-purple-900/10 border-valorant/20 p-12 md:p-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Harekete Geç!
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Hemen kayıt ol, takımını kur ve turnuvalarda yerini al. Rakiplerini yenerek zirveye tırman!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Kayıt Ol
              </Link>
              <Link to="/tournaments" className="btn-secondary text-lg px-8 py-3">
                Turnuvaları İncele
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
