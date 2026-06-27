import api from './api';

export const lfgService = {
  async list(params?: Record<string, string>) {
    const res = await api.get('/lfg', { params });
    return res.data;
  },

  async filters() {
    const res = await api.get('/lfg/filters');
    return res.data;
  },

  async myPosts() {
    const res = await api.get('/lfg/my');
    return res.data.posts;
  },

  async create(data: {
    type: string;
    game: string;
    role?: string;
    rank?: string;
    description: string;
    contact_info?: string;
  }) {
    const res = await api.post('/lfg', data);
    return res.data;
  },

  async update(id: number, data: any) {
    const res = await api.put(`/lfg/${id}`, data);
    return res.data;
  },

  async toggle(id: number) {
    const res = await api.post(`/lfg/${id}/toggle`);
    return res.data;
  },

  async delete(id: number) {
    const res = await api.delete(`/lfg/${id}`);
    return res.data;
  },
};
