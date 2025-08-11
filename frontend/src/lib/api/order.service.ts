import { api } from '../api-client';

export interface Address {
  lat: number;
  lng: number;
  address: string;
  detail?: string;
}

export interface CreateOrderDto {
  recipientName: string;
  recipientPhone: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  packageType: 'DOCUMENT' | 'PACKAGE' | 'FOOD' | 'OTHER';
  packageSize: 'SMALL' | 'MEDIUM' | 'LARGE' | 'EXTRA_LARGE';
  deliveryType?: 'STANDARD' | 'EXPRESS';
  urgency?: 'NORMAL' | 'URGENT' | 'VERY_URGENT';
  scheduledPickupTime?: string;
  notes?: string;
  distance?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  companyId: string;
  courierId?: string;
  recipientName: string;
  recipientPhone: string;
  pickupAddress: Address;
  deliveryAddress: Address;
  packageType: string;
  packageSize: string;
  deliveryType: string;
  urgency: string;
  scheduledPickupTime?: string;
  notes?: string;
  distance?: number;
  estimatedTime?: number;
  price: number;
  commission?: number;
  courierEarning?: number;
  status: 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED' | 'REJECTED';
  acceptedAt?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  deliveryProof?: string;
  rating?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    name: string;
    phone: string;
  };
  courier?: {
    fullName: string;
    phone: string;
    vehicleInfo: any;
    rating?: number;
  };
  payments?: any[];
}

export interface OrderListResponse {
  data: Order[];
  total: number;
  skip: number;
  take: number;
}

export const orderService = {
  // Yeni sipariş oluştur
  createOrder: async (data: CreateOrderDto) => {
    const response = await api.post<Order>('/orders', data);
    return response.data;
  },

  // Firma siparişlerini listele
  getCompanyOrders: async (params?: {
    skip?: number;
    take?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const response = await api.get<OrderListResponse>(`/orders/company?${queryParams.toString()}`);
    return response.data;
  },

  // Sipariş detayını getir
  getOrderById: async (id: string) => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },

  // Siparişi iptal et
  cancelOrder: async (id: string, reason: string) => {
    const response = await api.post<Order>(`/orders/${id}/cancel`, { reason });
    return response.data;
  },

  // Siparişi değerlendir
  rateOrder: async (id: string, rating: number, feedback?: string) => {
    const response = await api.post<Order>(`/orders/${id}/rate`, { rating, feedback });
    return response.data;
  },

  // Müsait siparişleri listele (kurye için)
  getAvailableOrders: async (params?: {
    skip?: number;
    take?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());

    const response = await api.get<OrderListResponse>(`/orders/available?${queryParams.toString()}`);
    return response.data;
  },

  // Siparişi kabul et (kurye için)
  acceptOrder: async (id: string) => {
    const response = await api.post<Order>(`/orders/${id}/accept`);
    return response.data;
  },

  // Sipariş durumunu güncelle (kurye için)
  updateOrderStatus: async (id: string, status: string, data?: {
    deliveryProof?: string;
    cancellationReason?: string;
  }) => {
    const response = await api.patch<Order>(`/orders/${id}/status`, {
      status,
      ...data
    });
    return response.data;
  },
};