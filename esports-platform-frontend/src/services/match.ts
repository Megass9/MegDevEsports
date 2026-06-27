import api from './api';

export const matchService = {
  async getById(id: number) {
    const res = await api.get(`/matches/${id}`);
    return res.data;
  },

  async myMatches() {
    const res = await api.get('/matches/my');
    return res.data;
  },

  async submitResult(matchId: number, data: FormData) {
    const res = await api.post(`/matches/${matchId}/result`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async confirm(matchId: number, teamId: number) {
    const res = await api.post(`/matches/${matchId}/confirm`, { team_id: teamId });
    return res.data;
  },

  async dispute(matchId: number, reason: string) {
    const res = await api.post(`/matches/${matchId}/dispute`, { reason });
    return res.data;
  },
};
