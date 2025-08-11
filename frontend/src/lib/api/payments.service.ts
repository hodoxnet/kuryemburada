import { api } from '../api-client';

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  approvedAt?: string;
  approvedBy?: number;
  refundedAt?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentsService = {
  // Ödeme listesi
  getPayments: async (params?: {
    status?: string;
    skip?: number;
    take?: number;
  }) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  // Bekleyen ödemeler
  getPendingPayments: async () => {
    const response = await api.get<Payment[]>('/payments/pending');
    return response.data;
  },

  // Ödeme onayla
  approvePayment: async (id: number) => {
    const response = await api.patch<Payment>(`/payments/${id}/approve`);
    return response.data;
  },

  // Ödeme reddet
  rejectPayment: async (id: number, reason: string) => {
    const response = await api.patch<Payment>(`/payments/${id}/reject`, { reason });
    return response.data;
  },

  // İade işlemi
  refundPayment: async (id: number, reason: string) => {
    const response = await api.post<Payment>(`/payments/${id}/refund`, { reason });
    return response.data;
  },

  // Toplu onaylama
  bulkApprove: async (paymentIds: number[]) => {
    const response = await api.post('/payments/bulk-approve', { paymentIds });
    return response.data;
  },

  // İstatistikler
  getPaymentStats: async () => {
    const response = await api.get('/payments/stats');
    return response.data;
  },
};