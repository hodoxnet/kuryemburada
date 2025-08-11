import { api } from '../api-client';

export interface PricingRule {
  id: number;
  name: string;
  description?: string;
  ruleType: 'DISTANCE' | 'ZONE' | 'TIME' | 'PACKAGE' | 'CUSTOM';
  basePrice: number;
  pricePerKm?: number;
  minDistance?: number;
  maxDistance?: number;
  zones?: string[];
  timeSlots?: any[];
  packageTypes?: string[];
  priority: number;
  multiplier?: number;
  fixedAmount?: number;
  conditions?: any;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
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
  updatePricingRule: async (id: number, data: Partial<PricingRule>) => {
    const response = await api.patch<PricingRule>(`/pricing/${id}`, data);
    return response.data;
  },

  // Kuralı sil
  deletePricingRule: async (id: number) => {
    await api.delete(`/pricing/${id}`);
  },

  // Fiyat hesapla
  calculatePrice: async (params: any) => {
    const response = await api.post<{ price: number }>('/pricing/calculate', params);
    return response.data;
  },
};