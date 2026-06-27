import api from './api';
import type { Tournament, Bracket } from '../types';

export const homeService = {
  async stats() {
    const res = await api.get('/home/stats');
    return res.data;
  },

  async dashboard() {
    const res = await api.get('/dashboard');
    return res.data;
  },
};

export const tournamentService = {
  async list(params?: Record<string, string>) {
    const res = await api.get('/tournaments', { params });
    return res.data;
  },

  async getActive() {
    const res = await api.get<{ tournaments: Tournament[] }>('/tournaments/active');
    return res.data.tournaments;
  },

  async getHistory() {
    const res = await api.get('/tournaments/history');
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<{ tournament: Tournament; bracket: Bracket }>(`/tournaments/${id}`);
    return res.data;
  },

  async getBracket(id: number) {
    const res = await api.get<{ bracket: Bracket }>(`/tournaments/${id}/bracket`);
    return res.data.bracket;
  },

  async register(data: { tournament_id: number; team_id: number }) {
    const res = await api.post(`/tournaments/${data.tournament_id}/register`, { team_id: data.team_id });
    return res.data;
  },

  async unregister(tournamentId: number, teamId: number) {
    const res = await api.post(`/tournaments/${tournamentId}/unregister`, { team_id: teamId });
    return res.data;
  },

  async checkIn(tournamentId: number, teamId: number) {
    const res = await api.post(`/tournaments/${tournamentId}/check-in`, { team_id: teamId });
    return res.data;
  },

  async pendingCheckIn() {
    const res = await api.get('/tournaments/my/pending-checkin');
    return res.data.tournaments;
  },
};
