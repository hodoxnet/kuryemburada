import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class YemeksepetiAuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const remoteId = request.params?.remoteId;

    if (!remoteId) {
      throw new UnauthorizedException('remoteId gerekli');
    }

    const vendor = await this.prisma.yemeksepetiVendor.findUnique({
      where: { remoteId },
      select: {
        inboundToken: true,
        isActive: true,
        id: true,
      },
    });

    if (!vendor || !vendor.isActive) {
      throw new UnauthorizedException('Yemeksepeti vendor bulunamadı veya pasif');
    }

    if (!vendor.inboundToken) {
      throw new UnauthorizedException('Firma için Yemeksepeti inbound token tanımlı değil');
    }

    const inboundToken = vendor.inboundToken;
    const authHeader: string | undefined = request.headers?.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header eksik');
    }

    const token = authHeader.substring('Bearer '.length).trim();

    // Yemeksepeti JWT token gönderiyor - secret key ile doğrula
    try {
      // JWT formatında mı kontrol et (eyJ ile başlar)
      if (token.startsWith('eyJ')) {
        const decoded = jwt.verify(token, inboundToken, { algorithms: ['HS512', 'HS256'] });
        console.log('[YemeksepetiAuthGuard] JWT doğrulandı:', decoded);
      } else {
        // Statik token karşılaştırması (fallback)
        if (token !== inboundToken) {
          throw new Error('Token eşleşmiyor');
        }
      }
    } catch (error) {
      console.log('[YemeksepetiAuthGuard] Token doğrulama hatası:', error.message);
      throw new UnauthorizedException('Geçersiz Yemeksepeti imzası');
    }

    request.yemeksepetiVendor = vendor;
    return true;
  }
}
