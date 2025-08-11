import { api } from '../api-client';

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCompanies: number;
  totalCouriers: number;
  activeOrders: number;
  completedOrders: number;
  averageDeliveryTime: number;
  customerSatisfaction: number;
}

export const reportsService = {
  // Dashboard istatistikleri
  getDashboardStats: async () => {
    const response = await api.get<DashboardStats>('/reports/dashboard');
    return response.data;
  },

  // Sipariş raporu
  getOrderReport: async (params: {
    startDate: string;
    endDate: string;
    groupBy?: string;
  }) => {
    const response = await api.get('/reports/orders', { params });
    return response.data;
  },

  // Ödeme raporu
  getPaymentReport: async (params: {
    startDate: string;
    endDate: string;
    groupBy?: string;
  }) => {
    const response = await api.get('/reports/payments', { params });
    return response.data;
  },

  // Gelir raporu
  getRevenueReport: async (params: {
    startDate: string;
    endDate: string;
    groupBy?: string;
  }) => {
    const response = await api.get('/reports/revenue', { params });
    return response.data;
  },

  // Performans raporu
  getPerformanceReport: async (type: 'courier' | 'company', params: any) => {
    const response = await api.get(`/reports/performance/${type}`, { params });
    return response.data;
  },
};