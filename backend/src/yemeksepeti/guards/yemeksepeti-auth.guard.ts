import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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

    if (token !== inboundToken) {
      throw new UnauthorizedException('Geçersiz Yemeksepeti imzası');
    }

    request.yemeksepetiVendor = vendor;
    return true;
  }
}
