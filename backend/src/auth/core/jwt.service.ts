import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class CoreJwtService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Kullanıcı için access ve refresh token üretir
   */
  async generateTokens(user: User): Promise<AuthTokens> {
    const payload: Omit<JwtPayload, 'type'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRES_IN', '15m'),
      },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
      },
    );

    // Refresh token'ı veritabanına kaydet
    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Access token doğrular
   */
  async validateAccessToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      if (payload.type !== 'access') {
        return null;
      }

      return payload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh token doğrular ve yeni token çifti üretir
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens | null> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      if (payload.type !== 'refresh') {
        return null;
      }

      // Refresh token'ın veritabanında geçerli olup olmadığını kontrol et
      const storedToken = await this.prisma.refreshToken.findFirst({
        where: {
          userId: payload.sub,
          tokenHash: refreshToken, // Using tokenHash instead of token
          expiresAt: {
            gt: new Date(),
          },
          isRevoked: false,
        },
      });

      if (!storedToken) {
        return null;
      }

      // Kullanıcıyı bul
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        return null;
      }

      // Eski refresh token'ı sil
      await this.revokeRefreshToken(refreshToken);

      // Yeni token çifti üret
      return this.generateTokens(user);
    } catch (error) {
      return null;
    }
  }

  /**
   * Kullanıcının tüm refresh tokenlarını iptal eder
   */
  async revokeAllRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  /**
   * Belirli bir refresh token'ı iptal eder
   */
  async revokeRefreshToken(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: refreshToken },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'manual_revocation',
      },
    });
  }

  /**
   * Refresh token'ı veritabanına kaydeder
   */
  private async saveRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const expiresAt = new Date();
    const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d');
    
    // Süreyi gün cinsinden hesapla
    const days = parseInt(refreshExpiresIn.replace('d', ''));
    expiresAt.setDate(expiresAt.getDate() + days);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshToken, // Using tokenHash instead of token
        family: `family_${userId}_${Date.now()}`, // Simple family generation
        expiresAt,
      },
    });
  }
}