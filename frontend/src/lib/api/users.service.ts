import { api } from '../api-client';

export interface User {
  id: number;
  email: string;
  role: 'SUPER_ADMIN' | 'COMPANY' | 'COURIER';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const usersService = {
  // Kullanıcı listesi
  getUsers: async (params?: {
    role?: string;
    status?: string;
    skip?: number;
    take?: number;
  }) => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  // Kullanıcı detayı
  getUser: async (id: number) => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Yeni kullanıcı oluştur
  createUser: async (data: {
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  // Kullanıcı güncelle
  updateUser: async (id: number, data: Partial<User>) => {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  // Kullanıcı sil
  deleteUser: async (id: number) => {
    await api.delete(`/users/${id}`);
  },

  // Durum değiştir
  toggleUserStatus: async (id: number) => {
    const response = await api.patch<User>(`/users/${id}/toggle-status`);
    return response.data;
  },

  // Kullanıcı engelle
  blockUser: async (id: number, reason: string) => {
    const response = await api.patch<User>(`/users/${id}/block`, { reason });
    return response.data;
  },

  // Şifre sıfırla
  resetPassword: async (id: number, newPassword: string) => {
    const response = await api.patch(`/users/${id}/reset-password`, { newPassword });
    return response.data;
  },
};