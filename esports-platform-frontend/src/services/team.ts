import api from './api';
import type { Team, TeamInvitation } from '../types';

export const teamService = {
  async list() {
    const res = await api.get('/teams');
    return res.data;
  },

  async getById(id: number) {
    const res = await api.get<{ team: Team }>(`/teams/${id}`);
    return res.data.team;
  },

  async create(data: { name: string; description?: string; game?: string }) {
    const res = await api.post('/teams', data);
    return res.data;
  },

  async update(id: number, data: Partial<Team>) {
    const res = await api.put(`/teams/${id}`, data);
    return res.data;
  },

  async delete(id: number) {
    const res = await api.delete(`/teams/${id}`);
    return res.data;
  },

  async uploadLogo(id: number, file: File) {
    const form = new FormData();
    form.append('logo', file);
    const res = await api.post(`/teams/${id}/logo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async invite(teamId: number, userId: number) {
    const res = await api.post(`/teams/${teamId}/invite`, { user_id: userId });
    return res.data;
  },

  async joinByCode(code: string) {
    const res = await api.post('/teams/join', { code });
    return res.data;
  },

  async leave(teamId: number) {
    const res = await api.post(`/teams/${teamId}/leave`);
    return res.data;
  },

  async kick(teamId: number, userId: number) {
    const res = await api.post(`/teams/${teamId}/kick/${userId}`);
    return res.data;
  },

  async transferCaptaincy(teamId: number, userId: number) {
    const res = await api.post(`/teams/${teamId}/transfer-captaincy`, { user_id: userId });
    return res.data;
  },

  async myTeams() {
    const res = await api.get('/teams/my/list');
    return res.data;
  },

  async invitations() {
    const res = await api.get<{ invitations: TeamInvitation[] }>('/teams/my/invitations');
    return res.data.invitations;
  },

  async acceptInvitation(id: number) {
    const res = await api.post(`/teams/invitations/${id}/accept`);
    return res.data;
  },

  async declineInvitation(id: number) {
    const res = await api.post(`/teams/invitations/${id}/decline`);
    return res.data;
  },
};
