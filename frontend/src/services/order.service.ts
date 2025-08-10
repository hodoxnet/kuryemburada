import { api } from '@/lib/api-client';

export interface Order {
  id: string;
  orderNumber: string;
  companyId: string;
  courierId?: string;
  status: 'PENDING' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  pickupAddress: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  items: string;
  totalAmount: number;
  notes?: string;
  pickupTime?: Date;
  deliveryTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderRequest {
  pickupAddress: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  items: string;
  totalAmount: number;
  notes?: string;
  pickupTime?: Date;
}

export interface UpdateOrderRequest {
  status?: string;
  courierId?: string;
  deliveryTime?: Date;
  notes?: string;
}

export interface OrderListParams {
  page?: number;
  limit?: number;
  status?: string;
  companyId?: string;
  courierId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const orderService = {
  // Sipariş listesi
  getOrders: async (params?: OrderListParams) => {
    const response = await api.get<{ orders: Order[]; total: number }>('/orders', { params });
    return response.data;
  },

  // Tek sipariş detayı
  getOrder: async (id: string) => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  // Yeni sipariş oluştur
  createOrder: async (data: CreateOrderRequest) => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  // Sipariş güncelle
  updateOrder: async (id: string, data: UpdateOrderRequest) => {
    const response = await api.patch<Order>(`/orders/${id}`, data);
    return response.data;
  },

  // Sipariş iptal et
  cancelOrder: async (id: string, reason?: string) => {
    const response = await api.post(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Siparişi kuryeye ata
  assignCourier: async (orderId: string, courierId: string) => {
    const response = await api.post(`/orders/${orderId}/assign`, { courierId });
    return response.data;
  },

  // Sipariş durumu güncelle
  updateStatus: async (orderId: string, status: string) => {
    const response = await api.patch(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Sipariş geçmişi
  getOrderHistory: async (orderId: string) => {
    const response = await api.get(`/orders/${orderId}/history`);
    return response.data;
  },

  // Sipariş istatistikleri
  getOrderStats: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await api.get('/orders/stats', { params });
    return response.data;
  },
};