import api from './api';
import type { AdminStats } from '../types';

export const adminService = {
  async updateUser(id: number, data: { name?: string; email?: string; riot_id?: string }) {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data;
  },

  async changeUserRole(id: number, role: string) {
    const res = await api.post(`/admin/users/${id}/change-role`, { role });
    return res.data;
  },

  async checkInStatus(tournamentId: number) {
    const res = await api.get(`/admin/tournaments/${tournamentId}/check-in-status`);
    return res.data;
  },

  async resolveDispute(matchId: number, action: string, team1Score?: number, team2Score?: number) {
    const res = await api.post(`/admin/tournaments/matches/${matchId}/resolve-dispute`, { action, team1_score: team1Score, team2_score: team2Score });
    return res.data;
  },

  async getSettings() {
    const res = await api.get('/admin/settings');
    return res.data;
  },

  async updateSettings(settings: Record<string, string>) {
    const res = await api.put('/admin/settings', { settings });
    return res.data;
  },

  async getAvailableGames() {
    const res = await api.get('/admin/settings/games');
    return res.data;
  },

  async addGame(game: string) {
    const res = await api.post('/admin/settings/games', { game });
    return res.data;
  },

  async removeGame(game: string) {
    const res = await api.delete('/admin/settings/games', { data: { game } });
    return res.data;
  },
  async getDashboard() {
    const res = await api.get<{ stats: AdminStats }>('/admin/dashboard');
    return res.data;
  },

  async users(params?: Record<string, string>) {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  async banUser(id: number, reason: string) {
    const res = await api.post(`/admin/users/${id}/ban`, { reason });
    return res.data;
  },

  async unbanUser(id: number) {
    const res = await api.post(`/admin/users/${id}/unban`);
    return res.data;
  },

  async deleteUser(id: number) {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
  },

  async teams(params?: Record<string, string>) {
    const res = await api.get('/admin/teams', { params });
    return res.data;
  },

  async deleteTeam(id: number) {
    const res = await api.delete(`/admin/teams/${id}`);
    return res.data;
  },

  async tournaments(params?: Record<string, string>) {
    const res = await api.get('/admin/tournaments', { params });
    return res.data;
  },

  async createTournament(data: any) {
    const res = await api.post('/admin/tournaments', data);
    return res.data;
  },

  async updateTournament(id: number, data: any) {
    const res = await api.put(`/admin/tournaments/${id}`, data);
    return res.data;
  },

  async cancelTournament(id: number, reason: string) {
    const res = await api.post(`/admin/tournaments/${id}/cancel`, { reason });
    return res.data;
  },

  async openRegistration(id: number) {
    const res = await api.post(`/admin/tournaments/${id}/open-registration`);
    return res.data;
  },

  async startTournament(id: number) {
    const res = await api.post(`/admin/tournaments/${id}/start`);
    return res.data;
  },

  async completeTournament(id: number, winnerId: number) {
    const res = await api.post(`/admin/tournaments/${id}/complete`, { winner_id: winnerId });
    return res.data;
  },

  async confirmMatch(matchId: number) {
    const res = await api.post(`/admin/tournaments/matches/${matchId}/confirm`);
    return res.data;
  },

  async setMatchResult(matchId: number, team1Score: number, team2Score: number) {
    const res = await api.post(`/admin/tournaments/matches/${matchId}/set-result`, { team1_score: team1Score, team2_score: team2Score });
    return res.data;
  },

  async getLogs(params?: Record<string, string>) {
    const res = await api.get('/admin/logs', { params });
    return res.data;
  },

  async sendAnnouncement(message: string, pin?: boolean) {
    const res = await api.post('/admin/announcements', { message, pin });
    return res.data;
  },

  async sendSystemNotification(title: string, message: string) {
    const res = await api.post('/admin/system-notifications', { title, message });
    return res.data;
  },

  async rewards() {
    const res = await api.get('/admin/rewards');
    return res.data;
  },

  async createReward(data: any) {
    const res = await api.post('/admin/rewards', data);
    return res.data;
  },

  async approveReward(id: number) {
    const res = await api.post(`/admin/rewards/${id}/approve`);
    return res.data;
  },

  async deliverReward(id: number, notes?: string) {
    const res = await api.post(`/admin/rewards/${id}/deliver`, { notes });
    return res.data;
  },

  async getGlobalChat() {
    const res = await api.get('/admin/chat/global');
    return res.data;
  },

  async getTeamChat() {
    const res = await api.get('/admin/chat/team');
    return res.data;
  },

  async deleteChatMessage(id: number) {
    const res = await api.delete(`/admin/chat/${id}`);
    return res.data;
  },

  async pinChatMessage(id: number) {
    const res = await api.post(`/admin/chat/${id}/pin`);
    return res.data;
  },

  async acceptOcr(matchResultId: number) {
    const res = await api.post(`/admin/tournaments/ocr/${matchResultId}/accept`);
    return res.data;
  },

  async rejectOcr(matchResultId: number) {
    const res = await api.post(`/admin/tournaments/ocr/${matchResultId}/reject`);
    return res.data;
  },

  async reanalyzeOcr(matchResultId: number) {
    const res = await api.post(`/admin/tournaments/ocr/${matchResultId}/reanalyze`);
    return res.data;
  },

  // Support Tickets
  async getSupportTickets(params?: any) {
    const res = await api.get('/admin/support', { params });
    return res.data;
  },

  async getSupportTicket(id: number) {
    const res = await api.get(`/admin/support/${id}`);
    return res.data;
  },

  async replySupportTicket(id: number, adminReply: string) {
    const res = await api.post(`/admin/support/${id}/reply`, { admin_reply: adminReply });
    return res.data;
  },

  async closeSupportTicket(id: number) {
    const res = await api.post(`/admin/support/${id}/close`);
    return res.data;
  },
};
