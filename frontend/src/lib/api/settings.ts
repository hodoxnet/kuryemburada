import apiClient from '../api-client';

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettingData {
  key: string;
  value: any;
  description?: string;
}

export interface UpdateSettingData {
  value: any;
  description?: string;
}

export interface SettingsCategory {
  commission: {
    rate: number;
    minAmount: number;
    maxAmount: number;
  };
  order: {
    maxCancellationTime: number;
    autoAssignRadius: number;
    maxDeliveryTime: number;
  };
  courier: {
    maxActiveOrders: number;
    minRating: number;
    inactivityPeriod: number;
  };
  company: {
    creditLimit: number;
    paymentDueDays: number;
    minOrderAmount: number;
  };
  notification: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
  };
  system: {
    maintenanceMode: boolean;
    apiRateLimit: number;
    sessionTimeout: number;
  };
}

const settingsAPI = {
  // Tüm ayarları getir
  async getAll(skip?: number, take?: number): Promise<{ data: SystemSetting[], total: number }> {
    const params = new URLSearchParams();
    if (skip !== undefined) params.append('skip', skip.toString());
    if (take !== undefined) params.append('take', take.toString());
    
    const response = await apiClient.get(`/settings?${params.toString()}`);
    return response.data;
  },

  // Tek bir ayarı getir
  async getOne(key: string): Promise<SystemSetting> {
    const response = await apiClient.get(`/settings/${key}`);
    return response.data;
  },

  // Kategoriye göre ayarları getir
  async getByCategory(category: string): Promise<Record<string, any>> {
    const response = await apiClient.get(`/settings/category/${category}`);
    return response.data;
  },

  // Varsayılan ayarları getir
  async getDefaults(): Promise<SettingsCategory> {
    const response = await apiClient.get('/settings/defaults');
    return response.data;
  },

  // Yeni ayar oluştur
  async create(data: CreateSettingData): Promise<SystemSetting> {
    const response = await apiClient.post('/settings', data);
    return response.data;
  },

  // Ayar güncelle
  async update(key: string, data: UpdateSettingData): Promise<SystemSetting> {
    const response = await apiClient.patch(`/settings/${key}`, data);
    return response.data;
  },

  // Kategori ayarlarını toplu güncelle
  async updateByCategory(category: string, values: Record<string, any>): Promise<SystemSetting[]> {
    const response = await apiClient.patch(`/settings/category/${category}`, values);
    return response.data;
  },

  // Ayar sil
  async remove(key: string): Promise<SystemSetting> {
    const response = await apiClient.delete(`/settings/${key}`);
    return response.data;
  },

  // Varsayılan ayarları oluştur
  async initializeDefaults(): Promise<SystemSetting[]> {
    const response = await apiClient.post('/settings/initialize');
    return response.data;
  },
};

export default settingsAPI;