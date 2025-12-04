import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';

// Trendyol Go API Base URL'leri
const TRENDYOLGO_PROD_URL = 'https://api.tgoapis.com/integrator';
const TRENDYOLGO_STAGE_URL = 'https://stageapi.tgoapis.com/integrator';

// Rate limiting: 50 istek / 10 saniye
const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX_REQUESTS = 50;

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

export interface TrendyolGoPackage {
  id: string;
  orderId: string;
  orderNumber: string;
  sellerId: number;
  storeId: number;
  packageStatus: string;
  deliveryModel: string;
  totalCargo: number;
  grossAmount: number;
  totalDiscount: number;
  totalPrice: number;
  sellerInvoiceAmount: number;
  invoiceTaxAmount: number;
  isCourierNearby: boolean;
  orderDate: number;
  lastModifiedDate: number;
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  shipmentAddress: {
    id: number;
    address1: string;
    address2?: string;
    apartmentNumber?: string;
    floor?: string;
    doorNumber?: string;
    district: string;
    city: string;
    addressDescription?: string;
    latitude?: number;
    longitude?: number;
  };
  lines: Array<{
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    amount: number;
    price: number;
    discount: number;
    barcode?: string;
    lineItemPrices?: number[];
    lineItemDiscounts?: number[];
  }>;
}

export interface TrendyolGoPackageResponse {
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
  content: TrendyolGoPackage[];
}

export interface InvoiceAmountRange {
  min: number;
  max: number;
}

@Injectable()
export class TrendyolGoHttpService {
  private rateLimitMap = new Map<string, RateLimitEntry>();

  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  /**
   * Basic Auth header oluşturur
   * Format: base64(apiKey:apiSecret)
   */
  private createAuthHeader(apiKey: string, apiSecret: string): string {
    const credentials = `${apiKey}:${apiSecret}`;
    const encoded = Buffer.from(credentials).toString('base64');
    return `Basic ${encoded}`;
  }

  /**
   * User-Agent header oluşturur
   * Format: supplierId - agentName
   */
  private createUserAgent(supplierId: string, agentName: string): string {
    return `${supplierId} - ${agentName}`;
  }

  /**
   * Rate limiting kontrolü
   */
  private checkRateLimit(vendorId: string): void {
    const now = Date.now();
    const entry = this.rateLimitMap.get(vendorId);

    if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      // Yeni pencere başlat
      this.rateLimitMap.set(vendorId, { count: 1, windowStart: now });
      return;
    }

    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
      const waitTime = Math.ceil(
        (RATE_LIMIT_WINDOW_MS - (now - entry.windowStart)) / 1000,
      );
      throw new Error(
        `Trendyol Go rate limit aşıldı. ${waitTime} saniye bekleyin.`,
      );
    }

    entry.count++;
  }

  /**
   * Vendor bilgilerini alır
   */
  private async getVendorCredentials(vendorId: string) {
    const vendor = await this.prisma.trendyolGoVendor.findUnique({
      where: { id: vendorId },
      select: {
        supplierId: true,
        storeId: true,
        apiKey: true,
        apiSecret: true,
        agentName: true,
        executorEmail: true,
        isActive: true,
      },
    });

    if (!vendor || !vendor.isActive) {
      throw new Error('Trendyol Go vendor bulunamadı veya pasif');
    }

    if (!vendor.supplierId || !vendor.apiKey || !vendor.apiSecret) {
      throw new Error(
        'Firma için Trendyol Go API yapılandırması eksik (supplierId, apiKey veya apiSecret tanımlı değil)',
      );
    }

    return vendor;
  }

  /**
   * Trendyol Go API'ye GET isteği gönderir
   */
  async get<T>(
    vendorId: string,
    endpoint: string,
    params?: Record<string, string | number | undefined>,
  ): Promise<T> {
    this.checkRateLimit(vendorId);

    const vendor = await this.getVendorCredentials(vendorId);

    // URL oluştur
    const baseUrl = TRENDYOLGO_PROD_URL;
    let url = `${baseUrl}${endpoint}`;

    // Query parametrelerini ekle
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: this.createAuthHeader(vendor.apiKey, vendor.apiSecret),
      'User-Agent': this.createUserAgent(vendor.supplierId, vendor.agentName),
      'x-agentname': vendor.agentName,
    };

    if (vendor.executorEmail) {
      headers['x-executor-user'] = vendor.executorEmail;
    }

    this.logger.info('Trendyol Go GET isteği', {
      vendorId,
      url,
      supplierId: vendor.supplierId,
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (response.status === 429) {
      throw new Error('Trendyol Go rate limit aşıldı (429 Too Many Requests)');
    }

    if (response.status === 401) {
      throw new Error(
        'Trendyol Go kimlik doğrulama hatası (401 Unauthorized). API bilgilerinizi kontrol edin.',
      );
    }

    if (response.status === 403) {
      throw new Error(
        'Trendyol Go erişim reddedildi (403 Forbidden). User-Agent header kontrolünü yapın.',
      );
    }

    const text = await response.text();

    if (!response.ok) {
      this.logger.error('Trendyol Go GET isteği başarısız', {
        vendorId,
        url,
        status: response.status,
        body: text,
      });
      throw new Error(`Trendyol Go API hatası: ${response.status} - ${text}`);
    }

    try {
      return text ? JSON.parse(text) : (null as unknown as T);
    } catch {
      return text as unknown as T;
    }
  }

  /**
   * Trendyol Go API'ye PUT isteği gönderir
   */
  async put<T>(
    vendorId: string,
    endpoint: string,
    body?: Record<string, unknown>,
  ): Promise<T> {
    this.checkRateLimit(vendorId);

    const vendor = await this.getVendorCredentials(vendorId);

    const baseUrl = TRENDYOLGO_PROD_URL;
    const url = `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: this.createAuthHeader(vendor.apiKey, vendor.apiSecret),
      'User-Agent': this.createUserAgent(vendor.supplierId, vendor.agentName),
      'x-agentname': vendor.agentName,
    };

    if (vendor.executorEmail) {
      headers['x-executor-user'] = vendor.executorEmail;
    }

    this.logger.info('Trendyol Go PUT isteği', {
      vendorId,
      url,
      supplierId: vendor.supplierId,
      body,
    });

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 429) {
      throw new Error('Trendyol Go rate limit aşıldı (429 Too Many Requests)');
    }

    if (response.status === 401) {
      throw new Error(
        'Trendyol Go kimlik doğrulama hatası (401 Unauthorized). API bilgilerinizi kontrol edin.',
      );
    }

    const text = await response.text();

    if (!response.ok) {
      this.logger.error('Trendyol Go PUT isteği başarısız', {
        vendorId,
        url,
        status: response.status,
        body: text,
      });
      throw new Error(`Trendyol Go API hatası: ${response.status} - ${text}`);
    }

    try {
      return text ? JSON.parse(text) : (null as unknown as T);
    } catch {
      return text as unknown as T;
    }
  }

  /**
   * Sipariş paketlerini çeker
   */
  async getPackages(
    vendorId: string,
    options?: {
      status?: string | string[];
      startDate?: number;
      endDate?: number;
      page?: number;
      size?: number;
      sortDirection?: 'ASC' | 'DESC';
    },
  ): Promise<TrendyolGoPackageResponse> {
    const vendor = await this.getVendorCredentials(vendorId);
    const supplierId = vendor.supplierId;

    let endpoint = `/order/grocery/suppliers/${supplierId}/packages`;

    // Query parametreleri
    const params: Record<string, string | number | undefined> = {};

    if (options?.startDate) {
      params.startDate = options.startDate;
    }
    if (options?.endDate) {
      params.endDate = options.endDate;
    }
    if (options?.page !== undefined) {
      params.page = options.page;
    }
    if (options?.size) {
      params.size = Math.min(options.size, 200); // Max 200
    }
    if (options?.sortDirection) {
      params.sortDirection = options.sortDirection;
    }
    if (vendor.storeId) {
      params.storeId = parseInt(vendor.storeId);
    }

    // Status parametresi için özel işlem (birden fazla olabilir)
    if (options?.status) {
      const statusArray = Array.isArray(options.status)
        ? options.status
        : [options.status];
      // Her status için ayrı parametre eklenmeli
      // URL'e manuel ekleyeceğiz
      const statusParams = statusArray.map((s) => `status=${s}`).join('&');
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      endpoint +=
        '?' +
        (queryString ? `${queryString}&${statusParams}` : statusParams);

      // get metodunda params kullanmayacağız
      return this.getWithFullUrl<TrendyolGoPackageResponse>(vendorId, endpoint);
    }

    return this.get<TrendyolGoPackageResponse>(vendorId, endpoint, params);
  }

  /**
   * Tam URL ile GET isteği (status parametresi için)
   */
  private async getWithFullUrl<T>(vendorId: string, endpoint: string): Promise<T> {
    this.checkRateLimit(vendorId);

    const vendor = await this.getVendorCredentials(vendorId);

    const baseUrl = TRENDYOLGO_PROD_URL;
    const url = `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: this.createAuthHeader(vendor.apiKey, vendor.apiSecret),
      'User-Agent': this.createUserAgent(vendor.supplierId, vendor.agentName),
      'x-agentname': vendor.agentName,
    };

    if (vendor.executorEmail) {
      headers['x-executor-user'] = vendor.executorEmail;
    }

    this.logger.info('Trendyol Go GET isteği', {
      vendorId,
      url,
      supplierId: vendor.supplierId,
    });

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const text = await response.text();

    if (!response.ok) {
      this.logger.error('Trendyol Go GET isteği başarısız', {
        vendorId,
        url,
        status: response.status,
        body: text,
      });
      throw new Error(`Trendyol Go API hatası: ${response.status} - ${text}`);
    }

    try {
      return text ? JSON.parse(text) : (null as unknown as T);
    } catch {
      return text as unknown as T;
    }
  }

  /**
   * Paket ID'ye göre sipariş çeker
   */
  async getPackageById(
    vendorId: string,
    packageId: string,
  ): Promise<TrendyolGoPackageResponse> {
    const vendor = await this.getVendorCredentials(vendorId);
    const supplierId = vendor.supplierId;

    const endpoint = `/order/grocery/suppliers/${supplierId}/packages/ids`;
    return this.get<TrendyolGoPackageResponse>(vendorId, endpoint, {
      id: packageId,
    });
  }

  /**
   * Sipariş kabul (Picking) bildirimi gönderir
   */
  async sendPickedStatus(vendorId: string, packageId: string): Promise<void> {
    const vendor = await this.getVendorCredentials(vendorId);
    const supplierId = vendor.supplierId;

    const endpoint = `/order/grocery/suppliers/${supplierId}/packages/${packageId}/picked`;
    await this.put(vendorId, endpoint);

    this.logger.info('Trendyol Go Picking bildirimi gönderildi', {
      vendorId,
      packageId,
    });
  }

  /**
   * Sipariş hazırlandı (Invoiced) bildirimi gönderir
   */
  async sendInvoicedStatus(
    vendorId: string,
    packageId: string,
    invoiceData: {
      invoiceAmount: number;
      bagCount?: number;
      receiptLink?: string;
      invoiceTaxAmount?: number;
    },
  ): Promise<void> {
    const vendor = await this.getVendorCredentials(vendorId);
    const supplierId = vendor.supplierId;

    const endpoint = `/order/grocery/suppliers/${supplierId}/packages/${packageId}/invoiced`;
    await this.put(vendorId, endpoint, invoiceData);

    this.logger.info('Trendyol Go Invoiced bildirimi gönderildi', {
      vendorId,
      packageId,
      invoiceData,
    });
  }

  /**
   * Invoice amount aralığını kontrol eder
   */
  async getInvoiceAmountRange(
    vendorId: string,
    orderId: string,
  ): Promise<InvoiceAmountRange> {
    const vendor = await this.getVendorCredentials(vendorId);
    const supplierId = vendor.supplierId;

    const endpoint = `/order/grocery/suppliers/${supplierId}/orders/${orderId}/invoice-amount`;
    return this.get<InvoiceAmountRange>(vendorId, endpoint);
  }

  /**
   * Bağlantıyı test eder
   */
  async testConnection(vendorId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Basit bir paket listesi çekmeyi dene
      await this.getPackages(vendorId, {
        size: 1,
        sortDirection: 'DESC',
      });

      return {
        success: true,
        message: 'Trendyol Go bağlantısı başarılı',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Bilinmeyen hata',
      };
    }
  }
}
