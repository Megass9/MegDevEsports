import { useState } from 'react';
import { User, Mail, Shield, Camera, Bell, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { notificationService } from '../services/notification';
import { useEffect } from 'react';
import type { Notification } from '../types';
import { formatDate } from '../utils/format';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [riotId, setRiotId] = useState(user?.riot_id || '');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications'>('profile');

  useEffect(() => {
    notificationService.list().then((res) => {
      setNotifications(res.notifications?.data || res.notifications || []);
      setUnreadCount(res.unread_count || 0);
    }).catch(() => {});
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/profile', { name, riot_id: riotId });
      setUser(res.data.user);
      toast.success('Profil güncellendi.');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Güncelleme başarısız.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.append('avatar', file);
    try {
      const res = await api.post('/profile/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (user) {
        setUser({ ...user, avatar_url: res.data.avatar_url });
      }
      toast.success('Profil resmi güncellendi.');
    } catch {
      toast.error('Yükleme başarısız.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const markAllRead = async () => {
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    toast.success('Tüm bildirimler okundu.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'profile' ? 'bg-valorant text-white' : 'bg-surface-400 text-gray-400'
          }`}
        >
          Profil
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${
            activeTab === 'notifications' ? 'bg-valorant text-white' : 'bg-surface-400 text-gray-400'
          }`}
        >
          Bildirimler
          {unreadCount > 0 && (
            <span className="ml-2 bg-white text-valorant text-xs px-1.5 py-0.5 rounded-full font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'profile' ? (
        <div className="space-y-6">
          {/* Avatar */}
          <div className="card text-center">
            <div className="relative inline-block">
              <img
                src={user?.avatar_url}
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-valorant rounded-full flex items-center justify-center cursor-pointer hover:bg-accent-hover transition-colors">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <h1 className="text-xl font-display font-bold text-white mt-4">{user?.name}</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="inline-block mt-2 badge-primary">
              {user?.role_label}
            </span>
          </div>

          {/* Profile Form */}
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-4">Profil Bilgileri</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">İsim</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Riot ID</label>
                <input
                  type="text"
                  value={riotId}
                  onChange={(e) => setRiotId(e.target.value)}
                  className="input-field"
                  placeholder="Örn: Player#TR1"
                />
              </div>
              <button type="submit" className="btn-primary">
                Kaydet
              </button>
            </form>
          </div>

          {/* Danger Zone */}
          <div className="card border-red-500/20">
            <h2 className="text-lg font-semibold text-red-400 mb-4">Çıkış Yap</h2>
            <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors">
              <LogOut className="w-4 h-4" />
              Çıkış Yap
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Bildirimler</h2>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-sm text-valorant hover:text-accent-hover">
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Bildirim bulunmuyor.</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 rounded-lg ${
                    n.is_read ? 'bg-surface-400' : 'bg-valorant/5 border border-valorant/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{n.title}</p>
                      <p className="text-xs text-gray-400 mt-1">{n.message}</p>
                    </div>
                    <span className="text-[10px] text-gray-500">{formatDate(n.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
