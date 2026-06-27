import api from './api';

export const supportService = {
  async create(data: { subject: string; message: string; priority?: string }) {
    const res = await api.post('/support', data);
    return res.data;
  },

  async list() {
    const res = await api.get('/support');
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get(`/support/${id}`);
    return res.data;
  },

  async reply(id: number, userReply: string) {
    const res = await api.post(`/support/${id}/reply`, { user_reply: userReply });
    return res.data;
  },
};
