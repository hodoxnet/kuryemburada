import apiClient from '../api-client';

export interface DailyReconciliation {
  id: string;
  companyId: string;
  date: string;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalAmount: number;
  courierCost: number;
  platformCommission: number;
  netAmount: number;
  status: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE';
  paidAmount: number;
  remainingAmount: number;
  notes?: string;
  reconciledBy?: string;
  reconciledAt?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    name: string;
    taxNumber?: string;
  };
}

export interface CompanyBalance {
  id: string;
  companyId: string;
  currentBalance: number;
  totalDebts: number;
  totalCredits: number;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationSummary {
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  totalAmount: number;
  courierCost: number;
  platformCommission: number;
  netAmount: number;
  totalPaid: number;
  totalRemaining: number;
  currentBalance: number;
}

export interface DailyOrderReport {
  date: string;
  orders: any[];
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalAmount: number;
  courierCost: number;
  platformCommission: number;
  netAmount: number;
}

export interface CompanyPayment {
  id: string;
  companyId: string;
  reconciliationId?: string;
  paymentType: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  description?: string;
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const reconciliationAPI = {
  // Firma sipariş raporlarını getir (günlük gruplu)
  async getCompanyOrdersReport(startDate?: string, endDate?: string): Promise<DailyOrderReport[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`/reconciliation/company/orders-report?${params.toString()}`);
    return response.data;
  },

  // Firma mutabakatlarını getir
  async getCompanyReconciliations(startDate?: string, endDate?: string): Promise<DailyReconciliation[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`/reconciliation/company?${params.toString()}`);
    return response.data;
  },

  // Firma özet raporunu getir
  async getCompanySummary(startDate?: string, endDate?: string): Promise<ReconciliationSummary> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`/reconciliation/company/summary?${params.toString()}`);
    return response.data;
  },

  // Tek bir mutabakat detayını getir
  async getReconciliation(id: string): Promise<DailyReconciliation> {
    const response = await apiClient.get(`/reconciliation/${id}`);
    return response.data;
  },

  // Admin: Tüm mutabakatları getir
  async getAllReconciliations(params?: {
    status?: string;
    companyId?: string;
    startDate?: string;
    endDate?: string;
    skip?: number;
    take?: number;
  }): Promise<{ data: DailyReconciliation[], total: number }> {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append('status', params.status);
    if (params?.companyId) queryParams.append('companyId', params.companyId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());
    
    const response = await apiClient.get(`/reconciliation?${queryParams.toString()}`);
    return response.data;
  },

  // Admin: Günlük mutabakatları oluştur
  async generateDailyReconciliations(): Promise<any> {
    const response = await apiClient.post('/reconciliation/generate-daily');
    return response.data;
  },

  // Admin: Belirli bir firma için mutabakat oluştur
  async createReconciliation(companyId: string, date?: string): Promise<DailyReconciliation> {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    
    const response = await apiClient.post(`/reconciliation/company/${companyId}?${params.toString()}`);
    return response.data;
  },

  // Admin: Mutabakat güncelle
  async updateReconciliation(id: string, data: {
    status?: string;
    paidAmount?: number;
    notes?: string;
  }): Promise<DailyReconciliation> {
    const response = await apiClient.patch(`/reconciliation/${id}`, data);
    return response.data;
  },

  // Admin: Ödeme işle
  async processPayment(reconciliationId: string, data: {
    amount: number;
    paymentMethod: string;
    transactionReference?: string;
    description?: string;
  }): Promise<CompanyPayment> {
    const response = await apiClient.post(`/reconciliation/${reconciliationId}/payment`, data);
    return response.data;
  },
};

export default reconciliationAPI;