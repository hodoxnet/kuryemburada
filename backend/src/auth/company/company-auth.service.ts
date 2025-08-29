import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreJwtService } from '../core/jwt.service';
import { CorePasswordService } from '../core/password.service';
import { BaseAuthService, BaseLoginResponse, BaseRegisterResponse } from '../core/base-auth.service';
import { CompanyLoginDto } from './dto/company-login.dto';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { UserRole, UserStatus, CompanyStatus } from '@prisma/client';

@Injectable()
export class CompanyAuthService extends BaseAuthService {
  constructor(
    prisma: PrismaService,
    jwtService: CoreJwtService,
    passwordService: CorePasswordService,
  ) {
    super(prisma, jwtService, passwordService);
  }

  /**
   * Company login process
   */
  async login(credentials: CompanyLoginDto): Promise<BaseLoginResponse> {
    const user = await this.validateCompanyCredentials(credentials);
    const tokens = await this.generateTokens(user);

    // Update last login time
    await this.updateLastLogin(user.id);

    return {
      ...tokens,
      user: this.transformCompanyResponse(user),
    };
  }

  /**
   * Company registration process
   */
  async register(data: CompanyRegisterDto): Promise<BaseRegisterResponse> {
    // Check email uniqueness
    await this.checkEmailUniqueness(data.email);

    // Validate password strength
    const passwordValidation = this.validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Eğer vergi numarası verilmişse unique olup olmadığını kontrol et
    if (data.taxNumber) {
      const existingCompany = await this.prisma.company.findFirst({
        where: { taxNumber: data.taxNumber }
      });
      
      if (existingCompany) {
        throw new ConflictException('Bu vergi numarası zaten kullanılıyor');
      }
    }

    try {
      // Create user and company in transaction
      const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: await this.hashPassword(data.password),
          role: UserRole.COMPANY,
          status: UserStatus.PENDING, // Companies need approval
        },
      });

      const company = await tx.company.create({
        data: {
          userId: user.id,
          name: data.companyName,
          phone: data.phone,
          taxNumber: data.taxNumber || null, // Opsiyonel vergi numarası
          taxOffice: data.taxOffice || null, // Opsiyonel vergi dairesi
          tradeLicenseNo: data.tradeRegistryNumber || null,
          status: CompanyStatus.PENDING,
          address: data.address as any,
          contactPerson: data.contactPerson as any,
        },
      });

        return { user, company };
      });

      return {
        user: this.transformRegistrationResponse(result),
        message: 'Company registration successful. Waiting for admin approval.',
      };
    } catch (error) {
      // Prisma unique constraint hatalarını yakalayıp daha anlaşılır hale getir
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('taxNumber')) {
          throw new ConflictException('Bu vergi numarası zaten kullanılıyor');
        }
        if (error.meta?.target?.includes('email')) {
          throw new ConflictException('Bu e-posta adresi zaten kullanılıyor');
        }
        throw new ConflictException('Bu bilgiler zaten kullanılıyor');
      }
      
      // Diğer hataları tekrar fırlat
      throw error;
    }
  }

  /**
   * Validate company credentials
   */
  private async validateCompanyCredentials(credentials: CompanyLoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: credentials.email,
        role: UserRole.COMPANY,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid company credentials');
    }

    // Check user status
    this.validateUserStatus(user);

    // Check company status
    if (!user.company || user.company.status !== CompanyStatus.APPROVED) {
      throw new ForbiddenException('Company account is not approved yet');
    }

    // Validate password
    const isValidPassword = await this.validatePassword(
      credentials.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid company credentials');
    }

    return user;
  }

  /**
   * Transform company user data for frontend response
   */
  private transformCompanyResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      company: {
        id: user.company.id,
        name: user.company.name,
        phone: user.company.phone,
        status: user.company.status,
        address: user.company.address,
        contactPerson: user.company.contactPerson,
        taxNumber: user.company.taxNumber,
        tradeLicenseNo: user.company.tradeLicenseNo,
        activityArea: user.company.activityArea,
      },
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }

  /**
   * Transform registration response
   */
  private transformRegistrationResponse(result: any) {
    return {
      id: result.user.id,
      email: result.user.email,
      status: result.user.status,
      company: {
        id: result.company.id,
        name: result.company.name,
        phone: result.company.phone,
        status: result.company.status,
      },
    };
  }

  /**
   * Update last login time
   */
  private async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });
  }

  /**
   * Get company profile
   */
  async getCompanyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        role: UserRole.COMPANY,
      },
      include: {
        company: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Company user not found');
    }

    return this.transformCompanyResponse(user);
  }

  /**
   * Update company profile
   */
  async updateCompanyProfile(userId: string, updateData: Partial<CompanyRegisterDto>) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        role: UserRole.COMPANY,
      },
      include: {
        company: true,
      },
    });

    if (!user || !user.company) {
      throw new UnauthorizedException('Company user not found');
    }

    const updatedCompany = await this.prisma.company.update({
      where: { id: user.company.id },
      data: {
        name: updateData.companyName || user.company.name,
        phone: updateData.phone || user.company.phone,
        taxNumber: updateData.taxNumber || user.company.taxNumber,
        tradeLicenseNo: updateData.tradeRegistryNumber || user.company.tradeLicenseNo,
        activityArea: updateData.description || user.company.activityArea,
        address: (updateData.address || user.company.address) as any,
        contactPerson: (updateData.contactPerson || user.company.contactPerson) as any,
      },
    });

    return {
      message: 'Company profile updated successfully',
      company: updatedCompany,
    };
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        role: UserRole.COMPANY,
      },
      include: {
        company: true,
      },
    });

    if (!user || !user.company) {
      throw new UnauthorizedException('Company user not found');
    }

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      activeOrders,
    ] = await Promise.all([
      this.prisma.order.count({ where: { companyId: user.company.id } }),
      this.prisma.order.count({ where: { companyId: user.company.id, status: 'PENDING' } }),
      this.prisma.order.count({ where: { companyId: user.company.id, status: 'DELIVERED' } }),
      this.prisma.order.count({ 
        where: { 
          companyId: user.company.id, 
          status: { in: ['ACCEPTED', 'IN_PROGRESS', 'DELIVERED'] }
        } 
      }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      activeOrders,
      lastUpdated: new Date(),
    };
  }
}