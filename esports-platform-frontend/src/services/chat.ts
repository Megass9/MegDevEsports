import api from './api';
import type { ChatMessage } from '../types';

export const chatService = {
  async getRooms() {
    const res = await api.get<{ rooms: any[] }>('/chat/rooms');
    return res.data.rooms;
  },

  async getMessages(roomId: number) {
    const res = await api.get<{ messages: ChatMessage[]; pinned: ChatMessage[] }>(`/chat/rooms/${roomId}/messages`);
    return res.data;
  },

  async send(roomId: number, message: string, attachment?: File) {
    const form = new FormData();
    form.append('message', message);
    if (attachment) form.append('attachment', attachment);
    const res = await api.post(`/chat/rooms/${roomId}/send`, form, {
      headers: attachment ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return res.data;
  },

  async pin(messageId: number) {
    const res = await api.post(`/chat/${messageId}/pin`);
    return res.data;
  },

  async getTeamRoom(teamId: number) {
    const res = await api.get<{ room: any }>(`/chat/team/${teamId}`);
    return res.data.room;
  },

  async delete(messageId: number) {
    const res = await api.delete(`/chat/${messageId}`);
    return res.data;
  },
};
