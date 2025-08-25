import { Injectable, UnauthorizedException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CoreJwtService } from '../core/jwt.service';
import { CorePasswordService } from '../core/password.service';
import { BaseAuthService, BaseLoginResponse, BaseRegisterResponse } from '../core/base-auth.service';
import { CourierLoginDto } from './dto/courier-login.dto';
import { CourierRegisterDto } from './dto/courier-register.dto';
import { UserRole, UserStatus, CourierStatus } from '@prisma/client';

@Injectable()
export class CourierAuthService extends BaseAuthService {
  constructor(
    prisma: PrismaService,
    jwtService: CoreJwtService,
    passwordService: CorePasswordService,
  ) {
    super(prisma, jwtService, passwordService);
  }

  /**
   * Courier login process
   */
  async login(credentials: CourierLoginDto): Promise<BaseLoginResponse> {
    const user = await this.validateCourierCredentials(credentials);
    const tokens = await this.generateTokens(user);

    // Update last login time
    await this.updateLastLogin(user.id);

    return {
      ...tokens,
      user: this.transformCourierResponse(user),
    };
  }

  /**
   * Courier registration process
   */
  async register(data: CourierRegisterDto): Promise<BaseRegisterResponse> {
    // Check email uniqueness
    await this.checkEmailUniqueness(data.email);

    // Check TC number uniqueness
    await this.checkTcNumberUniqueness(data.tcNumber);

    // Validate password strength
    const passwordValidation = this.validatePasswordStrength(data.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Create user and courier in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: await this.hashPassword(data.password),
          role: UserRole.COURIER,
          status: UserStatus.PENDING, // Couriers need approval
        },
      });

      const courier = await tx.courier.create({
        data: {
          userId: user.id,
          fullName: data.fullName,
          tcNumber: data.tcNumber,
          phone: data.phone,
          birthDate: data.dateOfBirth,
          vehicleInfo: data.vehicleInfo as any,
          licenseInfo: data.licenseInfo as any,
          emergencyContact: {
            name: data.emergencyContactName,
            phone: data.emergencyContactPhone
          } as any,
          status: CourierStatus.PENDING,
        },
      });

      return { user, courier };
    });

    return {
      user: this.transformRegistrationResponse(result),
      message: 'Courier application submitted successfully. Waiting for admin approval.',
    };
  }

  /**
   * Validate courier credentials
   */
  private async validateCourierCredentials(credentials: CourierLoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: credentials.email,
        role: UserRole.COURIER,
      },
      include: {
        courier: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid courier credentials');
    }

    // Check user status
    this.validateUserStatus(user);

    // Check courier status
    if (!user.courier || user.courier.status !== CourierStatus.APPROVED) {
      throw new ForbiddenException('Courier account is not approved yet');
    }

    // Validate password
    const isValidPassword = await this.validatePassword(
      credentials.password,
      user.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid courier credentials');
    }

    return user;
  }

  /**
   * Check TC number uniqueness
   */
  private async checkTcNumberUniqueness(tcNumber: string): Promise<void> {
    const existingCourier = await this.prisma.courier.findUnique({
      where: { tcNumber },
    });

    if (existingCourier) {
      throw new ConflictException('This TC number is already registered');
    }
  }

  /**
   * Transform courier user data for frontend response
   */
  private transformCourierResponse(user: any) {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
      courier: {
        id: user.courier.id,
        fullName: user.courier.fullName,
        tcNumber: user.courier.tcNumber,
        phone: user.courier.phone,
        status: user.courier.status,
        dateOfBirth: user.courier.birthDate,
        vehicleInfo: user.courier.vehicleInfo,
        licenseInfo: user.courier.licenseInfo,
        rating: user.courier.rating,
        totalDeliveries: user.courier.totalDeliveries,
        emergencyContact: user.courier.emergencyContact,
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
      courier: {
        id: result.courier.id,
        fullName: result.courier.fullName,
        phone: result.courier.phone,
        status: result.courier.status,
      },
    };
  }

  /**
   * Update last login time
   */
  private async updateLastLogin(userId: string): Promise<void> {
    // Note: lastLoginAt field doesn't exist in current schema
    // This can be implemented when the field is added to the User model
    console.log(`Courier ${userId} logged in at ${new Date().toISOString()}`);
  }

  /**
   * Get courier profile
   */
  async getCourierProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        role: UserRole.COURIER,
      },
      include: {
        courier: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Courier user not found');
    }

    return this.transformCourierResponse(user);
  }

  /**
   * Update courier profile
   */
  async updateCourierProfile(userId: string, updateData: Partial<CourierRegisterDto>) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        role: UserRole.COURIER,
      },
      include: {
        courier: true,
      },
    });

    if (!user || !user.courier) {
      throw new UnauthorizedException('Courier user not found');
    }

    const updatedCourier = await this.prisma.courier.update({
      where: { id: user.courier.id },
      data: {
        fullName: updateData.fullName || user.courier.fullName,
        tcNumber: updateData.tcNumber || user.courier.tcNumber,
        phone: updateData.phone || user.courier.phone,
        vehicleInfo: (updateData.vehicleInfo || user.courier.vehicleInfo) as any,
        licenseInfo: (updateData.licenseInfo || user.courier.licenseInfo) as any,
        emergencyContact: {
          name: updateData.emergencyContactName || (user.courier.emergencyContact as any)?.name,
          phone: updateData.emergencyContactPhone || (user.courier.emergencyContact as any)?.phone
        } as any,
      },
    });

    return {
      message: 'Courier profile updated successfully',
      courier: updatedCourier,
    };
  }

  /**
   * Get courier statistics
   */
  async getCourierStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        role: UserRole.COURIER,
      },
      include: {
        courier: true,
      },
    });

    if (!user || !user.courier) {
      throw new UnauthorizedException('Courier user not found');
    }

    const [
      totalDeliveries,
      pendingDeliveries,
      completedDeliveries,
      activeDeliveries,
    ] = await Promise.all([
      this.prisma.order.count({ where: { courierId: user.courier.id } }),
      this.prisma.order.count({ where: { courierId: user.courier.id, status: 'ACCEPTED' } }),
      this.prisma.order.count({ where: { courierId: user.courier.id, status: 'DELIVERED' } }),
      this.prisma.order.count({ 
        where: { 
          courierId: user.courier.id, 
          status: { in: ['DELIVERED', 'IN_PROGRESS'] }
        } 
      }),
    ]);

    return {
      totalDeliveries,
      pendingDeliveries,
      completedDeliveries,
      activeDeliveries,
      rating: user.courier.rating,
      lastUpdated: new Date(),
    };
  }

  /**
   * Update courier location (for real-time tracking)
   */
  async updateLocation(userId: string, latitude: number, longitude: number) {
    const user = await this.prisma.user.findUnique({
      where: { 
        id: userId,
        role: UserRole.COURIER,
      },
      include: {
        courier: true,
      },
    });

    if (!user || !user.courier) {
      throw new UnauthorizedException('Courier user not found');
    }

    await this.prisma.courier.update({
      where: { id: user.courier.id },
      data: {
        currentLocation: {
          latitude,
          longitude,
          updatedAt: new Date(),
        },
      },
    });

    return { message: 'Location updated successfully' };
  }
}