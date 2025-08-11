import { api } from '../api-client';

export interface BoundaryPoint {
  lat: number;
  lng: number;
}

export interface ServiceArea {
  id: string;
  name: string;
  city: string;
  district: string;
  boundaries: BoundaryPoint[];
  basePrice: number;
  pricePerKm: number;
  maxDistance?: number;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    orders: number;
    pricingRules: number;
  };
}

export interface CreateServiceAreaDto {
  name: string;
  city: string;
  district: string;
  boundaries: BoundaryPoint[];
  basePrice: number;
  pricePerKm: number;
  maxDistance?: number;
  isActive?: boolean;
  priority?: number;
}

export interface UpdateServiceAreaDto extends Partial<CreateServiceAreaDto> {}

export interface ServiceAreaStatistics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  avgOrderPrice: number;
  pricingRules: number;
}

export const serviceAreaService = {
  // Tüm bölgeleri listele
  getAll: async (params?: {
    isActive?: boolean;
    city?: string;
    district?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.city) queryParams.append('city', params.city);
    if (params?.district) queryParams.append('district', params.district);

    const response = await api.get<ServiceArea[]>(`/service-areas?${queryParams.toString()}`);
    return response.data;
  },

  // Aktif bölgeleri listele
  getActive: async () => {
    const response = await api.get<ServiceArea[]>('/service-areas/active');
    return response.data;
  },

  // Tek bir bölge getir
  getById: async (id: string) => {
    const response = await api.get<ServiceArea>(`/service-areas/${id}`);
    return response.data;
  },

  // Yeni bölge oluştur
  create: async (data: CreateServiceAreaDto) => {
    const response = await api.post<ServiceArea>('/service-areas', data);
    return response.data;
  },

  // Bölge güncelle
  update: async (id: string, data: UpdateServiceAreaDto) => {
    const response = await api.patch<ServiceArea>(`/service-areas/${id}`, data);
    return response.data;
  },

  // Bölgeyi aktif/pasif yap
  toggleActive: async (id: string) => {
    const response = await api.patch<ServiceArea>(`/service-areas/${id}/toggle-active`);
    return response.data;
  },

  // Bölge sil
  delete: async (id: string) => {
    const response = await api.delete(`/service-areas/${id}`);
    return response.data;
  },

  // Bölge istatistikleri
  getStatistics: async (id: string) => {
    const response = await api.get<ServiceAreaStatistics>(`/service-areas/${id}/statistics`);
    return response.data;
  },
};