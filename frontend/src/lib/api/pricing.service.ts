import { api } from '../api-client';

export interface PricingRule {
  id: string;
  name: string;
  description?: string;
  serviceAreaId?: string;
  basePrice: number;
  pricePerKm?: number;
  pricePerMinute?: number;
  minimumPrice?: number;
  rushHourMultiplier?: number;
  weatherMultiplier?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PricingListResponse {
  data: PricingRule[];
  total: number;
  skip: number;
  take: number;
}

export const pricingService = {
  // Fiyatlandırma kurallarını getir
  getPricingRules: async () => {
    const response = await api.get<PricingListResponse>('/pricing');
    return response.data;
  },

  // Yeni kural oluştur
  createPricingRule: async (data: Partial<PricingRule>) => {
    const response = await api.post<PricingRule>('/pricing', data);
    return response.data;
  },

  // Kuralı güncelle
  updatePricingRule: async (id: string, data: Partial<PricingRule>) => {
    const response = await api.patch<PricingRule>(`/pricing/${id}`, data);
    return response.data;
  },

  // Kuralı aktif/pasif yap
  toggleActive: async (id: string) => {
    const response = await api.patch<PricingRule>(`/pricing/${id}/toggle-active`);
    return response.data;
  },

  // Kuralı sil
  deletePricingRule: async (id: string) => {
    await api.delete(`/pricing/${id}`);
  },

  // Fiyat hesapla
  calculatePrice: async (params: {
    distance: number;
    duration?: number;
    packageSize?: string;
    deliveryType?: string;
    urgency?: string;
  }) => {
    const response = await api.post<{ price: number }>('/pricing/calculate', params);
    return response.data;
  },
};