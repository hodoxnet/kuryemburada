import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreJwtService, AuthTokens } from './jwt.service';
import { CorePasswordService } from './password.service';
import { User, UserRole, UserStatus } from '@prisma/client';

export interface BaseLoginResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

export interface BaseRegisterResponse {
  user: any;
  message: string;
}

@Injectable()
export abstract class BaseAuthService {
  constructor(
    protected prisma: PrismaService,
    protected jwtService: CoreJwtService,
    protected passwordService: CorePasswordService,
  ) {}

  /**
   * Kullanıcı için token çifti üretir
   */
  protected async generateTokens(user: User): Promise<AuthTokens> {
    return this.jwtService.generateTokens(user);
  }

  /**
   * Şifreyi doğrular
   */
  protected async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return this.passwordService.verify(plainPassword, hashedPassword);
  }

  /**
   * Şifreyi hash'ler
   */
  protected async hashPassword(password: string): Promise<string> {
    return this.passwordService.hash(password);
  }

  /**
   * Kullanıcının tüm refresh tokenlarını iptal eder
   */
  protected async revokeRefreshTokens(userId: string): Promise<void> {
    return this.jwtService.revokeAllRefreshTokens(userId);
  }

  /**
   * Email benzersizliğini kontrol eder
   */
  protected async checkEmailUniqueness(email: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error('Bu e-posta adresi zaten kullanımda');
    }
  }

  /**
   * Kullanıcıyı ID'sine göre bulur
   */
  protected async findUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  /**
   * Kullanıcıyı email ve role'e göre bulur
   */
  protected async findUserByEmailAndRole(
    email: string,
    role: UserRole,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { 
        email,
        role,
      },
    });
  }

  /**
   * Şifre güçlülüğünü kontrol eder
   */
  protected validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    return this.passwordService.validatePasswordStrength(password);
  }

  /**
   * Kullanıcı durumunu kontrol eder
   */
  protected validateUserStatus(user: User): void {
    if (user.status === UserStatus.BLOCKED) {
      throw new Error('Hesabınız bloke edilmiştir');
    }

    if (user.status === UserStatus.PENDING) {
      throw new Error('Hesabınız henüz onaylanmamıştır');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('Hesabınızda bir sorun var');
    }
  }

  /**
   * Refresh token yeniler
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens | null> {
    return this.jwtService.refreshTokens(refreshToken);
  }

  /**
   * Kullanıcıyı çıkış yapar (tüm refresh tokenları iptal eder)
   */
  async logout(userId: string): Promise<void> {
    await this.revokeRefreshTokens(userId);
  }

  /**
   * Şifre değiştirir
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('Kullanıcı bulunamadı');
    }

    const isOldPasswordValid = await this.validatePassword(
      oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new Error('Mevcut şifre yanlış');
    }

    const passwordValidation = this.validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    const hashedNewPassword = await this.hashPassword(newPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    // Güvenlik için tüm oturumları sonlandır
    await this.revokeRefreshTokens(userId);
  }

  // Abstract metodlar - her service kendi implementasyonunu yapacak
  abstract login(credentials: any): Promise<BaseLoginResponse>;
  abstract register?(data: any): Promise<BaseRegisterResponse>;
}