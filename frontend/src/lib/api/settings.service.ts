import { api } from '../api-client';

export interface SystemSetting {
  id: number;
  key: string;
  value: any;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const settingsService = {
  // Tüm ayarları getir
  getSettings: async () => {
    const response = await api.get<{ data: SystemSetting[] }>('/settings');
    return response.data;
  },

  // Kategori bazlı ayarları getir
  getSettingsByCategory: async (category: string) => {
    const response = await api.get(`/settings/category/${category}`);
    return response.data;
  },

  // Ayar güncelle
  updateSetting: async (key: string, value: any) => {
    const response = await api.put<SystemSetting>(`/settings/${key}`, { value });
    return response.data;
  },

  // Kategori bazlı toplu güncelleme
  updateCategorySettings: async (category: string, values: Record<string, any>) => {
    const response = await api.put(`/settings/category/${category}`, values);
    return response.data;
  },

  // Varsayılan ayarları yükle
  initializeDefaults: async () => {
    const response = await api.post('/settings/initialize-defaults');
    return response.data;
  },
};