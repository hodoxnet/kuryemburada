import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UserRole, UserStatus, DocumentType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private documentsService: DocumentsService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: true,
        courier: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        `Account is ${user.status.toLowerCase()}`,
      );
    }

    const { password: _, ...result } = user;
    return result;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private generateTokenFamily(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);
    
    // Refresh token oluştur
    const refreshTokenValue = crypto.randomBytes(32).toString('hex');
    const refreshTokenJwt = this.jwtService.sign(
      { ...payload, tokenValue: refreshTokenValue },
      { expiresIn: '7d' },
    );
    
    // Token family oluştur (ilk login için)
    const tokenFamily = this.generateTokenFamily();
    
    // Eski aktif refresh token'ları revoke et
    await this.prisma.refreshToken.updateMany({
      where: {
        userId: user.id,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'new_login',
      },
    });
    
    // Yeni refresh token'ı veritabanına kaydet
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(refreshTokenValue),
        family: tokenFamily,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 gün
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenJwt,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        company: user.company,
        courier: user.courier,
      },
    };
  }

  async register(data: {
    email: string;
    password: string;
    role: UserRole;
  }) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        status: UserStatus.PENDING,
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async registerCourier(data: any, files?: Express.Multer.File[]) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // TC numarası ile kurye kontrolü
    const existingCourier = await this.prisma.courier.findUnique({
      where: { tcNumber: data.tcNumber },
    });

    if (existingCourier) {
      throw new BadRequestException('TC number already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Transaction ile kullanıcı ve kurye oluştur
    const result = await this.prisma.$transaction(async (tx) => {
      // Kullanıcı oluştur
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: UserRole.COURIER,
          status: UserStatus.PENDING,
        },
      });

      // Kurye profili oluştur
      const courier = await tx.courier.create({
        data: {
          userId: user.id,
          tcNumber: data.tcNumber,
          fullName: data.fullName,
          phone: data.phone,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          licenseInfo: data.licenseInfo || {},
          vehicleInfo: data.vehicleInfo || {},
          bankInfo: data.bankInfo || {},
          emergencyContact: data.emergencyContact || {},
          status: 'PENDING',
        },
      });

      // Bildirim oluştur
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Başvurunuz Alındı',
          message: 'Kurye başvurunuz başarıyla alındı. En kısa sürede size dönüş yapacağız.',
          type: 'SYSTEM',
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        courier,
      };
    });

    // Belgeleri yükle (transaction dışında)
    if (files && files.length > 0) {
      const documentTypeMap: { [key: string]: DocumentType } = {
        'identityfront': DocumentType.IDENTITY_CARD,
        'identityback': DocumentType.IDENTITY_CARD,
        'driverlicense': DocumentType.DRIVER_LICENSE,
        'vehicleregistration': DocumentType.VEHICLE_REGISTRATION,
        'criminalrecord': DocumentType.CRIMINAL_RECORD,
        'addressproof': DocumentType.ADDRESS_PROOF,
        'healthreport': DocumentType.HEALTH_REPORT,
        'tradelicense': DocumentType.TRADE_LICENSE,
        'taxcertificate': DocumentType.TAX_CERTIFICATE,
        'taxplate': DocumentType.TAX_PLATE,
      };

      for (const file of files) {
        try {
          // Dosya adından belge tipini belirle
          // Frontend'den gelen dosyanın orijinal adı fieldName olarak geliyor
          const originalName = file.originalname || '';
          let documentType: DocumentType = DocumentType.OTHER;
          
          // Belge tipini belirle - originalname'den kontrol et
          // Dosya adı formatı: identityFront_dosya.jpg gibi
          Object.keys(documentTypeMap).forEach(key => {
            if (originalName.toLowerCase().startsWith(key.toLowerCase())) {
              documentType = documentTypeMap[key];
            }
          });

          // Debug log
          console.log('Uploading document:', {
            originalName: originalName,
            documentType: documentType,
            userId: result.user.id,
          });
          
          // Belgeyi kaydet
          await this.documentsService.uploadDocument(
            file,
            { 
              type: documentType,
              userId: result.user.id,
              description: `Kurye başvuru belgesi - ${originalName}`
            },
            result.user.id,
          );
        } catch (error) {
          console.error('Document upload error:', error);
          // Belge yükleme hatası olsa bile kaydı iptal etmiyoruz
        }
      }
    }

    return result;
  }

  async registerCompany(data: any, files?: Express.Multer.File[]) {
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
        ],
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Vergi numarası ile firma kontrolü
    const existingCompany = await this.prisma.company.findUnique({
      where: { taxNumber: data.taxNumber },
    });

    if (existingCompany) {
      throw new BadRequestException('Tax number already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Transaction ile kullanıcı ve firma oluştur
    const result = await this.prisma.$transaction(async (tx) => {
      // Kullanıcı oluştur
      const user = await tx.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          role: UserRole.COMPANY,
          status: UserStatus.PENDING,
        },
      });

      // Firma profili oluştur
      const company = await tx.company.create({
        data: {
          userId: user.id,
          name: data.name,
          taxNumber: data.taxNumber,
          taxOffice: data.taxOffice,
          phone: data.phone,
          address: data.address,
          kepAddress: data.kepAddress,
          tradeLicenseNo: data.tradeLicenseNo,
          activityArea: data.activityArea,
          bankInfo: data.bankInfo || {},
          contactPerson: data.contactPerson,
          status: 'PENDING',
        },
      });

      // Bildirim oluştur
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Başvurunuz Alındı',
          message: 'Firma başvurunuz başarıyla alındı. En kısa sürede size dönüş yapacağız.',
          type: 'SYSTEM',
        },
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
        },
        company,
      };
    });

    // Belgeleri yükle (transaction dışında)
    if (files && files.length > 0) {
      const documentTypeMap: { [key: string]: DocumentType } = {
        'taxCertificate': DocumentType.TAX_CERTIFICATE,
        'tradeLicense': DocumentType.TRADE_LICENSE,
        'signatureCircular': DocumentType.OTHER,
        'kepAddress': DocumentType.KEP_ADDRESS,
        'identityCard': DocumentType.IDENTITY_CARD,
      };

      for (const file of files) {
        try {
          // Dosya adından belge tipini belirle
          // Frontend'den gelen dosyanın orijinal adı fieldName olarak geliyor
          const originalName = file.originalname || '';
          let documentType: DocumentType = DocumentType.OTHER;
          
          // Belge tipini belirle - originalname'den kontrol et
          // Dosya adı formatı: identityFront_dosya.jpg gibi
          Object.keys(documentTypeMap).forEach(key => {
            if (originalName.toLowerCase().startsWith(key.toLowerCase())) {
              documentType = documentTypeMap[key];
            }
          });

          // Belgeyi kaydet
          await this.documentsService.uploadDocument(
            file,
            { 
              type: documentType,
              userId: result.user.id,
              description: `Firma başvuru belgesi - ${originalName}`
            },
            result.user.id,
          );
        } catch (error) {
          console.error('Document upload error:', error);
          // Belge yükleme hatası olsa bile kaydı iptal etmiyoruz
        }
      }
    }

    return result;
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid old password');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
    
    // Şifre değişiminde tüm refresh token'ları revoke et
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'password_change',
      },
    });

    return { message: 'Password changed successfully' };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const tokenHash = this.hashToken(payload.tokenValue);
      
      // Atomic transaction ile race condition'ı önle
      return await this.prisma.$transaction(async (tx) => {
        // Token'ı veritabanında bul ve kilitle (SELECT FOR UPDATE)
        const storedToken = await tx.refreshToken.findUnique({
          where: { tokenHash },
          include: { user: true },
        });
        
        if (!storedToken) {
          throw new UnauthorizedException('Invalid refresh token');
        }
        
        // Token revoke edilmiş mi kontrol et
        if (storedToken.isRevoked) {
          // Token theft detection: Revoke edilmiş token kullanımı
          // Aynı family'deki tüm aktif token'ları revoke et
          await tx.refreshToken.updateMany({
            where: {
              family: storedToken.family,
              isRevoked: false,
            },
            data: {
              isRevoked: true,
              revokedAt: new Date(),
              revokedReason: 'suspicious_activity',
            },
          });
          // Genel hata mesajı - detay verme
          throw new UnauthorizedException('Invalid refresh token');
        }
        
        // Token süresi dolmuş mu kontrol et
        if (storedToken.expiresAt < new Date()) {
          // Genel hata mesajı - detay verme
          throw new UnauthorizedException('Invalid refresh token');
        }
        
        // Eski token'ı revoke et (atomic olarak)
        await tx.refreshToken.update({
          where: { id: storedToken.id },
          data: {
            isRevoked: true,
            revokedAt: new Date(),
            revokedReason: 'rotation',
          },
        });
        
        // Yeni token'lar oluştur (rotation)
        const newPayload = {
          email: storedToken.user.email,
          sub: storedToken.user.id,
          role: storedToken.user.role,
        };
        
        const newAccessToken = this.jwtService.sign(newPayload);
        
        // Yeni refresh token
        const newRefreshTokenValue = crypto.randomBytes(32).toString('hex');
        const newRefreshTokenJwt = this.jwtService.sign(
          { ...newPayload, tokenValue: newRefreshTokenValue },
          { expiresIn: '7d' },
        );
        
        // Yeni refresh token'ı kaydet (aynı family)
        await tx.refreshToken.create({
          data: {
            userId: storedToken.userId,
            tokenHash: this.hashToken(newRefreshTokenValue),
            family: storedToken.family, // Aynı family'yi koru
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });
        
        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshTokenJwt,
        };
      }, {
        isolationLevel: 'Serializable', // En yüksek izolasyon seviyesi
        timeout: 10000, // 10 saniye timeout
      });
    } catch (error) {
      if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  
  async logout(userId: string) {
    // Kullanıcının tüm aktif refresh token'larını revoke et
    await this.prisma.refreshToken.updateMany({
      where: {
        userId,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: 'logout',
      },
    });
    
    return { message: 'Logged out successfully' };
  }
}