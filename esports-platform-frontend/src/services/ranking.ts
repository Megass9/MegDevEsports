import api from './api';

export const rankingService = {
  async getGlobal() {
    const res = await api.get('/rankings/global');
    return res.data;
  },

  async bySeason(seasonId: number) {
    const res = await api.get(`/rankings/season/${seasonId}`);
    return res.data;
  },

  async getSeasons() {
    const res = await api.get('/rankings/seasons');
    return res.data;
  },

  async currentSeason() {
    const res = await api.get('/rankings/current-season');
    return res.data;
  },

  async teamRanking(teamId: number) {
    const res = await api.get(`/rankings/team/${teamId}`);
    return res.data;
  },
};
