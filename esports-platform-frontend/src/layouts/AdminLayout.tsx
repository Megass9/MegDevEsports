import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Shield,
  Swords,
  MessageCircle,
  ClipboardList,
  Gift,
  Megaphone,
  Settings2,
  Trophy,
  LogOut,
  ChevronLeft,
  Mail,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/users', label: 'Kullanıcılar', icon: Users },
  { path: '/admin/teams', label: 'Takımlar', icon: Shield },
  { path: '/admin/tournaments', label: 'Turnuvalar', icon: Swords },
  { path: '/admin/chat', label: 'Sohbet', icon: MessageCircle },
  { path: '/admin/rewards', label: 'Ödüller', icon: Gift },
  { path: '/admin/announcements', label: 'Duyuru', icon: Megaphone },
  { path: '/admin/support', label: 'Destek', icon: Mail },
  { path: '/admin/logs', label: 'Loglar', icon: ClipboardList },
  { path: '/admin/settings', label: 'Ayarlar', icon: Settings2 },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-500 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-600 border-r border-surface-400 hidden lg:flex flex-col">
        <div className="p-6 border-b border-surface-400">
          <Link to="/admin" className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-valorant" />
            <span className="font-display font-bold gradient-text">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-valorant/10 text-valorant font-semibold'
                    : 'text-gray-400 hover:text-white hover:bg-surface-400'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-400 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-surface-400 rounded-lg transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
            Siteye Dön
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-surface-400 rounded-lg transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Çıkış
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface-600 border-b border-surface-400 p-4">
        <div className="flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-valorant" />
            <span className="font-display font-bold gradient-text">ADMIN</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="btn-ghost text-xs">
              Site
            </Link>
            <button onClick={handleLogout} className="btn-ghost text-xs text-red-400">
              Çıkış
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-600 border-t border-surface-400 flex overflow-x-auto">
        {adminNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 text-[10px] min-w-[60px] ${
                isActive ? 'text-valorant' : 'text-gray-500'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Content */}
      <main className="flex-1 lg:pt-0 pt-16 pb-16 lg:pb-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
