import { api } from '../api-client';

export interface Courier {
  id: string;
  userId: string;
  tcNumber: string;
  fullName: string;
  birthDate?: string;
  phone: string;
  licenseInfo?: any;
  vehicleInfo?: any;
  bankInfo?: any;
  emergencyContact?: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE' | 'BUSY';
  rating?: number;
  totalDeliveries?: number;
  approvedAt?: string;
  rejectedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  documents?: Document[];
}

export interface Document {
  id: number;
  entityType: string;
  entityId: string;
  documentType: string;
  fileUrl: string;
  status: string;
  createdAt: string;
}

export interface UpdateCourierStatusDto {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface CourierListResponse {
  data: Courier[];
  total: number;
  skip: number;
  take: number;
}

export const courierService = {
  // Kurye listesini getir
  getCouriers: async (params?: {
    skip?: number;
    take?: number;
    status?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get<CourierListResponse>(`/couriers?${queryParams.toString()}`);
    return response.data;
  },

  // Bekleyen başvuruları getir
  getPendingCouriers: async (params?: { skip?: number; take?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());

    const response = await api.get<CourierListResponse>(`/couriers/pending?${queryParams.toString()}`);
    return response.data;
  },

  // Kurye detayını getir
  getCourier: async (id: string) => {
    const response = await api.get<Courier>(`/couriers/${id}`);
    return response.data;
  },

  // Kurye durumunu güncelle (onayla/reddet)
  updateCourierStatus: async (id: string, data: UpdateCourierStatusDto) => {
    const response = await api.patch<Courier>(`/couriers/${id}/status`, data);
    return response.data;
  },

  // Kurye istatistiklerini getir
  getCourierStats: async () => {
    const response = await api.get<{
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      active: number;
      busy: number;
    }>('/couriers/statistics');
    return response.data;
  },

  // Kurye belgelerini onayla
  approveDocument: async (courierId: string, documentId: number) => {
    const response = await api.patch(`/couriers/${courierId}/documents/${documentId}/approve`);
    return response.data;
  },

  // Kurye belgelerini reddet
  rejectDocument: async (courierId: string, documentId: number, reason: string) => {
    const response = await api.patch(`/couriers/${courierId}/documents/${documentId}/reject`, { reason });
    return response.data;
  },
};