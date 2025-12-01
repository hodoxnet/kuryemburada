import { Injectable, Inject } from '@nestjs/common';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';

interface CachedToken {
  token: string;
  expiresAt: number;
}

@Injectable()
export class YemeksepetiHttpService {
  private tokenCache = new Map<string, CachedToken>();

  constructor(
    private readonly prisma: PrismaService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async getAccessToken(vendorId: string, force = false): Promise<string> {
    if (!vendorId) {
      throw new Error('Yemeksepeti vendorId gerekli');
    }

    const now = Date.now();
    const cached = this.tokenCache.get(vendorId);
    if (!force && cached && cached.expiresAt > now + 60_000) {
      return cached.token;
    }

    const vendor = await this.prisma.yemeksepetiVendor.findUnique({
      where: { id: vendorId },
      select: {
        clientId: true,
        clientSecret: true,
        tokenUrl: true,
        isActive: true,
      },
    });

    if (!vendor || !vendor.isActive) {
      throw new Error('Yemeksepeti vendor bulunamadı veya pasif');
    }

    const { clientId, clientSecret, tokenUrl } = vendor;

    if (!clientId || !clientSecret || !tokenUrl) {
      throw new Error('Firma için Yemeksepeti OAuth yapılandırması eksik (clientId, clientSecret veya tokenUrl tanımlı değil)');
    }

    if (typeof fetch !== 'function') {
      throw new Error('fetch API desteklenmiyor (Node 18+ gerekli)');
    }

    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }).toString();

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error('Yemeksepeti token alınamadı', {
        vendorId,
        status: response.status,
        body: errorText,
      });
      throw new Error(`Yemeksepeti token alınamadı (${response.status})`);
    }

    const data = await response.json();
    const expiresIn = Number(data.expires_in ?? 0);
    const token = data.access_token as string;

    const expiresAt = now + expiresIn * 1000;
    this.tokenCache.set(vendorId, {
      token,
      expiresAt,
    });

    return token;
  }

  async postWithAuth(vendorId: string, url: string, payload: any) {
    if (!url) {
      throw new Error('Geçersiz Yemeksepeti callback URL');
    }

    if (typeof fetch !== 'function') {
      throw new Error('fetch API desteklenmiyor (Node 18+ gerekli)');
    }

    const accessToken = await this.getAccessToken(vendorId);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload ?? {}),
    });

    const text = await response.text();
    if (!response.ok) {
      this.logger.error('Yemeksepeti callback çağrısı başarısız', {
        url,
        vendorId,
        status: response.status,
        body: text,
      });
      throw new Error(`Yemeksepeti callback başarısız: ${response.status}`);
    }

    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return text || null;
    }
  }
}
