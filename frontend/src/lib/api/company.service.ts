import { api } from '../api-client';

export interface Company {
  id: number;
  userId: number;
  name: string;
  taxNumber: string;
  taxOffice: string;
  kepAddress?: string;
  phone: string;
  address: any;
  bankInfo?: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'INACTIVE';
  approvedAt?: string;
  rejectedAt?: string;
  approvedBy?: number;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyStatusDto {
  status: 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

export interface CompanyListResponse {
  data: Company[];
  total: number;
  skip: number;
  take: number;
}

export const companyService = {
  // Firma listesini getir
  getCompanies: async (params?: {
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

    const response = await api.get<CompanyListResponse>(`/companies?${queryParams.toString()}`);
    return response.data;
  },

  // Bekleyen başvuruları getir
  getPendingCompanies: async (params?: { skip?: number; take?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());

    const response = await api.get<CompanyListResponse>(`/companies/pending?${queryParams.toString()}`);
    return response.data;
  },

  // Firma detayını getir
  getCompany: async (id: number) => {
    const response = await api.get<Company>(`/companies/${id}`);
    return response.data;
  },

  // Firma durumunu güncelle (onayla/reddet)
  updateCompanyStatus: async (id: number, data: UpdateCompanyStatusDto) => {
    const response = await api.patch<Company>(`/companies/${id}/status`, data);
    return response.data;
  },

  // Firma istatistiklerini getir
  getCompanyStats: async () => {
    const response = await api.get<{
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      active: number;
    }>('/companies/statistics');
    return response.data;
  },
};