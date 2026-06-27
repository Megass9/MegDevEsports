import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Trophy,
  Users,
  Swords,
  BarChart3,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  HelpCircle,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { notificationService } from '../services/notification';
import AnnouncementBanner from '../components/AnnouncementBanner';
import { useTranslation } from '../hooks/useTranslation';

const navItems = [
  { path: '/', labelKey: 'nav.home', icon: Trophy },
  { path: '/tournaments', labelKey: 'nav.tournaments', icon: Swords },
  { path: '/lfg', labelKey: 'nav.lfg', icon: Users },
];

const moreItems = [
  { path: '/teams', labelKey: 'nav.teams', icon: Users },
  { path: '/ranking', labelKey: 'nav.ranking', icon: BarChart3 },
];

const authNavItems = [
  { path: '/my-teams', labelKey: 'nav.myTeams', icon: Shield },
  { path: '/matches', labelKey: 'nav.myMatches', icon: Swords },
  { path: '/destek', labelKey: 'nav.support', icon: HelpCircle },
];

export default function MainLayout() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t, locale, setLocale } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.unreadCount().then((c) => setUnreadNotifications(c)).catch(() => {});
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-500">
      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-500/95 backdrop-blur-md border-b border-surface-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-valorant" />
              <span className="text-lg font-display font-bold gradient-text">
                MEG DEV
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-surface-400 rounded-lg transition-all duration-200"
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.labelKey)}
                </Link>
              ))}
              {/* More Dropdown */}
              <div className="relative" ref={moreRef}>
                <button
                  onClick={() => setMoreOpen(!moreOpen)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-surface-400 rounded-lg transition-all duration-200"
                >
                  {t('nav.more')} <ChevronDown className="w-3 h-3" />
                </button>
                {moreOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                    <div className="absolute top-full left-0 mt-1 w-44 bg-surface-400 border border-gray-700 rounded-xl shadow-2xl z-20 py-2 animate-fade-in">
                      {moreItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMoreOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-300 hover:text-white transition-colors"
                        >
                  <item.icon className="w-4 h-4" />
                  {t(item.labelKey)}
                        </Link>
                      ))}
                      {isAuthenticated && (
                        <>
                          <div className="border-t border-gray-700 my-1" />
                          {authNavItems.map((item) => (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setMoreOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-300 hover:text-white transition-colors"
                            >
                              <item.icon className="w-4 h-4" />
                              {t(item.labelKey)}
                            </Link>
                          ))}

                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-valorant hover:bg-valorant/10 rounded-lg transition-all duration-200"
                >
                  {t('nav.admin')}
                </Link>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {/* Notifications */}
                  <Link to="/profile" className="relative p-2 text-gray-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-valorant rounded-full text-[10px] flex items-center justify-center text-white font-bold">
                        {unreadNotifications > 9 ? '9+' : unreadNotifications}
                      </span>
                    )}
                  </Link>

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setProfileOpen(!profileOpen)}
                      className="flex items-center gap-2 p-1.5 hover:bg-surface-400 rounded-lg transition-all"
                    >
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="hidden sm:block text-sm text-gray-300">{user.name}</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>

                    {profileOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                        <div className="absolute right-0 mt-2 w-56 bg-surface-400 border border-gray-700 rounded-xl shadow-2xl z-20 py-2 animate-fade-in">
                          <div className="px-4 py-3 border-b border-gray-700">
                            <p className="text-sm font-medium text-white">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                          <Link
                            to="/profile"
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-surface-300 hover:text-white transition-colors"
                          >
                            <User className="w-4 h-4" />
                            {t('nav.profile')}
                          </Link>
                          <div className="border-t border-gray-700 my-1" />
                          <div className="px-4 py-2 flex items-center gap-2">
                            <button
                              onClick={() => setLocale('tr')}
                              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${locale === 'tr' ? 'bg-valorant text-white' : 'text-gray-400 hover:text-white hover:bg-surface-300'}`}
                            >
                              TR
                            </button>
                            <button
                              onClick={() => setLocale('en')}
                              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${locale === 'en' ? 'bg-valorant text-white' : 'text-gray-400 hover:text-white hover:bg-surface-300'}`}
                            >
                              EN
                            </button>
                          </div>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-surface-300 hover:text-red-300 transition-colors w-full"
                          >
                            <LogOut className="w-4 h-4" />
                            {t('nav.logout')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm">
                    {t('nav.login')}
                  </Link>
                  <Link to="/register" className="btn-primary text-sm">
                    {t('nav.register')}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-400 bg-surface-500 animate-fade-in">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-surface-400 rounded-lg"
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.labelKey)}
                </Link>
              ))}
              {moreItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-surface-400 rounded-lg"
                >
                  <item.icon className="w-4 h-4" />
                  {t(item.labelKey)}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <div className="border-t border-surface-400 my-2" />
                  {authNavItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-surface-400 rounded-lg"
                    >
                      <item.icon className="w-4 h-4" />
                      {t(item.labelKey)}
                    </Link>
                  ))}
                </>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-valorant hover:bg-valorant/10 rounded-lg"
                >
                  {t('nav.admin')}
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <AnnouncementBanner />
        </div>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-400 bg-surface-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-valorant" />
              <span className="font-display font-bold gradient-text">MEG DEV</span>
            </div>
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Meg Dev. {locale === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
