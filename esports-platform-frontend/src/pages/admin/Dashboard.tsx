import { useEffect, useState } from 'react';
import { Users, Shield, Swords, Trophy, Ban, Clock, CheckCircle, Activity } from 'lucide-react';
import { adminService } from '../../services/admin';
import type { AdminStats } from '../../types';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    adminService.getDashboard().then((res) => setStats(res.stats)).catch(() => {});
  }, []);

  const statCards = [
    { icon: Users, label: 'Toplam Kullanıcı', value: stats?.total_users || 0, color: 'text-blue-400' },
    { icon: Shield, label: 'Toplam Takım', value: stats?.total_teams || 0, color: 'text-green-400' },
    { icon: Swords, label: 'Aktif Turnuva', value: stats?.active_tournaments || 0, color: 'text-valorant' },
    { icon: Trophy, label: 'Tamamlanan Turnuva', value: stats?.completed_tournaments || 0, color: 'text-yellow-500' },
    { icon: Activity, label: 'Toplam Maç', value: stats?.total_matches || 0, color: 'text-purple-400' },
    { icon: Clock, label: 'Onay Bekleyen Maç', value: stats?.pending_matches || 0, color: 'text-orange-400' },
    { icon: Ban, label: 'Banlanan Kullanıcı', value: stats?.banned_users || 0, color: 'text-red-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-display font-bold text-white mb-6">Dashboard</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-surface-400 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
