import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { TranslationProvider } from './hooks/useTranslation';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import MaintenancePage from './pages/MaintenancePage';
import HomePage from './pages/HomePage';
import LFGPage from './pages/LFGPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TournamentsPage from './pages/TournamentsPage';
import TournamentDetailPage from './pages/TournamentDetailPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import MyTeamsPage from './pages/MyTeamsPage';
import CreateTeamPage from './pages/CreateTeamPage';
import ProfilePage from './pages/ProfilePage';
import ReplayPage from './pages/ReplayPage';
import SupportPage from './pages/SupportPage';
import RankingPage from './pages/RankingPage';
import MatchPage from './pages/MatchPage';
import MatchDetailPage from './pages/MatchDetailPage';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminTeams from './pages/admin/Teams';
import AdminTournaments from './pages/admin/Tournaments';
import AdminChat from './pages/admin/Chat';
import AdminLogs from './pages/admin/Logs';
import AdminRewards from './pages/admin/Rewards';
import AdminAnnouncements from './pages/admin/Announcements';
import AdminSupport from './pages/admin/AdminSupport';
import AdminSettings from './pages/admin/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const [maintenance, setMaintenance] = useState(false);
  const [checking, setChecking] = useState(true);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const check = () => {
      fetch('/api/maintenance')
        .then((res) => res.json())
        .then((data) => setMaintenance(data.maintenance))
        .catch(() => {})
        .finally(() => setChecking(false));
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-surface-600 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-valorant border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (maintenance && user && user.role !== 'admin') {
    return <MaintenancePage />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0f1923',
            color: '#fff',
            border: '1px solid #1e293b',
          },
        }}
      />
      <TranslationProvider>
      {maintenance && (!user || user.role !== 'admin') ? (
        <MaintenancePage />
      ) : (
      <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Main Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/lfg" element={<LFGPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="/tournaments" element={<TournamentsPage />} />
          <Route path="/tournaments/:id" element={<TournamentDetailPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/teams/:id" element={<TeamDetailPage />} />
          <Route path="/ranking" element={<RankingPage />} />

          {/* Protected */}
          <Route
            path="/my-teams"
            element={
              <ProtectedRoute>
                <MyTeamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teams/create"
            element={
              <ProtectedRoute>
                <CreateTeamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches"
            element={
              <ProtectedRoute>
                <MatchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/matches/:id"
            element={
              <ProtectedRoute>
                <MatchDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/replays"
            element={
              <ProtectedRoute>
                <ReplayPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/destek"
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Admin Layout */}
        <Route
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/teams" element={<AdminTeams />} />
          <Route path="/admin/tournaments" element={<AdminTournaments />} />
          <Route path="/admin/chat" element={<AdminChat />} />
          <Route path="/admin/logs" element={<AdminLogs />} />
          <Route path="/admin/rewards" element={<AdminRewards />} />
          <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          <Route path="/admin/support" element={<AdminSupport />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
      )}
      </TranslationProvider>
    </>
  );
}
