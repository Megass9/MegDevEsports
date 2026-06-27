import api from './api';
import type { Notification } from '../types';

export const notificationService = {
  async list() {
    const res = await api.get<{ notifications: Notification[]; unread_count: number }>('/notifications');
    return res.data;
  },

  async markAsRead(id: number) {
    const res = await api.post(`/notifications/${id}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await api.post('/notifications/read-all');
    return res.data;
  },

  async unreadCount() {
    const res = await api.get<{ count: number }>('/notifications/unread-count');
    return res.data.count;
  },

  async delete(id: number) {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  },
};
