import apiClient from '../api-client';

// ==================== Interfaces ====================

export interface WhatsAppConfig {
  id: string;
  connectionMethod: 'MANUAL' | 'EMBEDDED_SIGNUP';
  phoneNumberId: string;
  businessAccountId: string;
  isActive: boolean;
  isVerified: boolean;
  welcomeMessage: string;
  offHoursMessage: string | null;
  notifyOnOrderApproval: boolean;
  notifyOnCourierAssign: boolean;
  notifyOnDelivery: boolean;
  connectedAt: string;
  lastTestedAt: string | null;
  webhookUrl: string;
}

export interface ManualSetupData {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken?: string;
}

export interface OAuthCallbackData {
  code: string;
  phoneNumberId?: string;
  businessAccountId?: string;
}

export interface UpdateSettingsData {
  welcomeMessage?: string;
  offHoursMessage?: string;
  notifyOnOrderApproval?: boolean;
  notifyOnCourierAssign?: boolean;
  notifyOnDelivery?: boolean;
  isActive?: boolean;
}

export interface TestConnectionResult {
  success: boolean;
  message: string;
  phoneNumber?: string;
  businessName?: string;
  error?: string;
}

export interface WhatsAppStatistics {
  todayMessages: number;
  todayOrders: number;
  todayConversionRate: number;
  weekMessages: number;
  weekOrders: number;
  weekConversionRate: number;
  monthMessages: number;
  monthOrders: number;
  monthConversionRate: number;
  activeSessions: number;
  dailyStats: Array<{
    date: string;
    messages: number;
    orders: number;
  }>;
}

export interface WhatsAppSession {
  id: string;
  phoneNumber: string;
  customerName: string | null;
  state: string;
  companyName: string | null;
  orderNumber: string | null;
  lastMessageAt: string;
  createdAt: string;
  expiresAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PendingOrder {
  id: string;
  orderNumber: string;
  orderContent: string;
  customerName: string;
  customerPhone: string;
  customerLocation: any;
  deliveryAddress: any;
  notes: string | null;
  createdAt: string;
}

export interface ApproveOrderData {
  price: number;
  estimatedDeliveryTime?: number;
  notes?: string;
}

export interface RejectOrderData {
  reason?: string;
}

// ==================== API Functions ====================

const whatsappAPI = {
  // ==================== Config ====================

  /**
   * WhatsApp config bilgilerini getir
   */
  async getConfig(): Promise<WhatsAppConfig | null> {
    const response = await apiClient.get('/whatsapp/config');
    return response.data;
  },

  /**
   * Manuel kurulum ile WhatsApp bağla
   */
  async manualSetup(data: ManualSetupData): Promise<WhatsAppConfig> {
    const response = await apiClient.post('/whatsapp/config/manual', data);
    return response.data;
  },

  /**
   * Embedded Signup OAuth callback
   */
  async oauthCallback(data: OAuthCallbackData): Promise<WhatsAppConfig> {
    const response = await apiClient.post('/whatsapp/oauth/callback', data);
    return response.data;
  },

  /**
   * Bağlantıyı test et
   */
  async testConnection(): Promise<TestConnectionResult> {
    const response = await apiClient.post('/whatsapp/config/test');
    return response.data;
  },

  /**
   * Ayarları güncelle
   */
  async updateSettings(data: UpdateSettingsData): Promise<WhatsAppConfig> {
    const response = await apiClient.put('/whatsapp/config/settings', data);
    return response.data;
  },

  /**
   * Bağlantıyı kes
   */
  async disconnect(): Promise<void> {
    await apiClient.delete('/whatsapp/config');
  },

  // ==================== Statistics ====================

  /**
   * İstatistikleri getir
   */
  async getStatistics(period: 'today' | 'week' | 'month' = 'today'): Promise<WhatsAppStatistics> {
    const response = await apiClient.get('/whatsapp/statistics', {
      params: { period },
    });
    return response.data;
  },

  // ==================== Sessions ====================

  /**
   * Aktif oturumları listele
   */
  async getSessions(page: number = 1, limit: number = 20): Promise<PaginatedResponse<WhatsAppSession>> {
    const response = await apiClient.get('/whatsapp/sessions', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Tek bir oturumu getir
   */
  async getSession(id: string): Promise<WhatsAppSession> {
    const response = await apiClient.get(`/whatsapp/sessions/${id}`);
    return response.data;
  },

  // ==================== Company Orders ====================

  /**
   * Onay bekleyen siparişleri listele (Firma paneli için)
   */
  async getPendingOrders(page: number = 1, limit: number = 20): Promise<PaginatedResponse<PendingOrder>> {
    const response = await apiClient.get('/whatsapp/orders/pending', {
      params: { page, limit },
    });
    return response.data;
  },

  /**
   * Siparişi onayla
   */
  async approveOrder(orderId: string, data: ApproveOrderData): Promise<any> {
    const response = await apiClient.post(`/whatsapp/orders/${orderId}/approve`, data);
    return response.data;
  },

  /**
   * Siparişi reddet
   */
  async rejectOrder(orderId: string, data: RejectOrderData): Promise<any> {
    const response = await apiClient.post(`/whatsapp/orders/${orderId}/reject`, data);
    return response.data;
  },

  // ==================== Test ====================

  /**
   * Test mesajı gönder
   */
  async sendTestMessage(phoneNumber: string, message: string): Promise<any> {
    const response = await apiClient.post('/whatsapp/test/send-message', {
      phoneNumber,
      message,
    });
    return response.data;
  },
};

export default whatsappAPI;
