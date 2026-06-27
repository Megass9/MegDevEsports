import api from './api';
import type { User } from '../types';

interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export const authService = {
  async register(data: { name: string; email: string; password: string; password_confirmation: string }) {
    const res = await api.post<AuthResponse>('/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await api.post<AuthResponse>('/login', data);
    return res.data;
  },

  async logout() {
    await api.post('/logout');
  },

  async getUser() {
    const res = await api.get<{ user: User }>('/user');
    return res.data.user;
  },
};
