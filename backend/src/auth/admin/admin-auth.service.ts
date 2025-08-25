import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreJwtService } from '../core/jwt.service';
import { CorePasswordService } from '../core/password.service';
import { BaseAuthService, BaseLoginResponse } from '../core/base-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserRole, UserStatus } from '@prisma/client';

@Injectable()
export class AdminAuthService extends BaseAuthService {
  constructor(
    prisma: PrismaService,
    jwtService: CoreJwtService,
    passwordService: CorePasswordService,
  ) {
    super(prisma, jwtService, passwordService);
  }

  /**
   * Admin giriş işlemi
   */
  async login(credentials: AdminLoginDto): Promise<BaseLoginResponse> {
    const admin = await this.validateAdminCredentials(credentials);
    const tokens = await this.generateTokens(admin);

    // Son giriş zamanını güncelle
    await this.updateLastLogin(admin.id);

    return {
      ...tokens,
      user: this.transformAdminResponse(admin),
    };
  }

  /**
   * Admin register is not implemented (admins are created manually)
   */
  async register(): Promise<never> {
    throw new Error('Admin registration is not allowed. Admins must be created manually.');
  }

  /**
   * Admin kimlik doğrulama
   */
  private async validateAdminCredentials(credentials: AdminLoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: credentials.email,
        role: UserRole.SUPER_ADMIN,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Geçersiz admin kimlik bilgileri');
    }

    // Kullanıcı durumunu kontrol et
    this.validateUserStatus(user);

    // Şifreyi doğrula
    const isValidPassword = await this.validatePassword(
      credentials.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Geçersiz admin kimlik bilgileri');
    }

    return user;
  }

  /**
   * Admin kullanıcı bilgilerini frontend için transform eder
   */
  private transformAdminResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      permissions: this.getAdminPermissions(),
      status: user.status,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * Admin yetkilerini döndürür
   */
  private getAdminPermissions(): string[] {
    return [
      'manage_companies',
      'manage_couriers', 
      'manage_orders',
      'view_reports',
      'manage_pricing',
      'manage_service_areas',
      'manage_settings',
      'view_analytics',
      'manage_notifications',
    ];
  }

  /**
   * Son giriş zamanını günceller
   */
  private async updateLastLogin(userId: string): Promise<void> {
    // Note: lastLoginAt field doesn't exist in current schema
    // This can be implemented when the field is added to the User model
    console.log(`User ${userId} logged in at ${new Date().toISOString()}`);
  }

  /**
   * Admin bilgilerini getir
   */
  async getAdminProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        role: UserRole.SUPER_ADMIN,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Admin kullanıcı bulunamadı');
    }

    return this.transformAdminResponse(user);
  }

  /**
   * Sistem istatistiklerini getir (admin için)
   */
  async getSystemStats() {
    const [
      totalCompanies,
      totalCouriers,
      totalOrders,
      activeCompanies,
      activeCouriers,
      pendingCompanies,
      pendingCouriers,
    ] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.courier.count(),
      this.prisma.order.count(),
      this.prisma.company.count({ where: { status: 'ACTIVE' } }),
      this.prisma.courier.count({ where: { status: 'ACTIVE' } }),
      this.prisma.company.count({ where: { status: 'PENDING' } }),
      this.prisma.courier.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalCompanies,
      totalCouriers,
      totalOrders,
      activeCompanies,
      activeCouriers,
      pendingApprovals: pendingCompanies + pendingCouriers,
      lastUpdated: new Date(),
    };
  }
}