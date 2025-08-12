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
  estimatedTime?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  trackingCode: string; // Takip kodu için alias
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
  totalPrice: number; // Price için alias
  estimatedDeliveryTime?: number; // EstimatedTime için alias
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
    id?: string;
    userId?: string;
    fullName?: string;
    phone?: string;
    vehicleInfo?: {
      plate?: string;
      brand?: string;
      model?: string;
      year?: number;
    };
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

// Order verilerini normalize et (backend'den gelen farklı alan isimlerini düzelt)
const normalizeOrder = (order: any): Order => {
  return {
    ...order,
    trackingCode: order.trackingCode || order.orderNumber,
    totalPrice: order.totalPrice ?? order.price,
    estimatedDeliveryTime: order.estimatedDeliveryTime ?? order.estimatedTime,
  };
};

export const orderService = {
  // Yeni sipariş oluştur
  createOrder: async (data: CreateOrderDto) => {
    const response = await api.post<any>('/orders', data);
    return normalizeOrder(response.data);
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

    const response = await api.get<any>(`/orders/company?${queryParams.toString()}`);
    // Backend { data: [], total, skip, take } formatında döndürüyor
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map(normalizeOrder);
    }
    // Eğer direkt array dönerse (eski format)
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeOrder);
    }
    return [];
  },

  // Sipariş detayını getir
  getOrderById: async (id: string) => {
    const response = await api.get<any>(`/orders/${id}`);
    return normalizeOrder(response.data);
  },

  // Siparişi iptal et
  cancelOrder: async (id: string, reason?: string) => {
    const response = await api.post<any>(`/orders/${id}/cancel`, { reason });
    return normalizeOrder(response.data);
  },

  // Siparişi değerlendir
  rateOrder: async (id: string, rating: number, feedback?: string) => {
    const response = await api.post<any>(`/orders/${id}/rate`, { rating, feedback });
    return normalizeOrder(response.data);
  },

  // Müsait siparişleri listele (kurye için)
  getAvailableOrders: async (params?: {
    skip?: number;
    take?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());

    const response = await api.get<any>(`/orders/available?${queryParams.toString()}`);
    // Backend { data: [], total, skip, take } formatında döndürüyor
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return {
        data: response.data.data.map(normalizeOrder),
        total: response.data.total,
        skip: response.data.skip,
        take: response.data.take
      };
    }
    // Eğer direkt array dönerse
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeOrder);
    }
    return [];
  },

  // Kuryenin siparişlerini listele
  getCourierOrders: async (params?: {
    skip?: number;
    take?: number;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.take !== undefined) queryParams.append('take', params.take.toString());
    if (params?.status) queryParams.append('status', params.status);

    const response = await api.get<any>(`/orders/courier?${queryParams.toString()}`);
    // Backend { data: [], total, skip, take } formatında döndürüyor
    if (response.data && response.data.data && Array.isArray(response.data.data)) {
      return response.data.data.map(normalizeOrder);
    }
    // Eğer direkt array dönerse
    if (Array.isArray(response.data)) {
      return response.data.map(normalizeOrder);
    }
    return [];
  },

  // Siparişi kabul et (kurye için)
  acceptOrder: async (id: string) => {
    const response = await api.post<any>(`/orders/${id}/accept`);
    return normalizeOrder(response.data);
  },

  // Sipariş durumunu güncelle (kurye için)
  updateOrderStatus: async (id: string, status: string, data?: {
    deliveryProof?: string;
    cancellationReason?: string;
  }) => {
    const response = await api.patch<any>(`/orders/${id}/status`, {
      status,
      ...data
    });
    return normalizeOrder(response.data);
  },

  // Kurye istatistiklerini getir
  getCourierStatistics: async () => {
    const response = await api.get<any>('/orders/courier/statistics');
    return response.data;
  },
};