import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Legacy auth (to be removed later)
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

// Core auth services
import { CoreJwtService } from './core/jwt.service';
import { CorePasswordService } from './core/password.service';
import { CoreJwtAuthGuard } from './core/guards/jwt-auth.guard';
import { RoleSpecificGuard } from './core/guards/role-specific.guard';

// Admin auth services
import { AdminAuthService } from './admin/admin-auth.service';
import { AdminAuthController } from './admin/admin-auth.controller';
import { AdminOnlyGuard } from './admin/guards/admin-only.guard';

// Company auth services
import { CompanyAuthService } from './company/company-auth.service';
import { CompanyAuthController } from './company/company-auth.controller';
import { CompanyOnlyGuard } from './company/guards/company-only.guard';

// Courier auth services
import { CourierAuthService } from './courier/courier-auth.service';
import { CourierAuthController } from './courier/courier-auth.controller';
import { CourierOnlyGuard } from './courier/guards/courier-only.guard';

import { PrismaModule } from '../prisma/prisma.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    DocumentsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    // Legacy controller (to be removed later)
    AuthController,
    // New modular controllers
    AdminAuthController,
    CompanyAuthController,
    CourierAuthController,
  ],
  providers: [
    // Legacy providers (to be removed later)
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    
    // Core services
    CoreJwtService,
    CorePasswordService,
    CoreJwtAuthGuard,
    RoleSpecificGuard,
    
    // Admin services
    AdminAuthService,
    AdminOnlyGuard,
    
    // Company services
    CompanyAuthService,
    CompanyOnlyGuard,
    
    // Courier services
    CourierAuthService,
    CourierOnlyGuard,
  ],
  exports: [
    // Legacy exports (to be removed later)
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    
    // New modular exports
    CoreJwtService,
    CorePasswordService,
    CoreJwtAuthGuard,
    RoleSpecificGuard,
    AdminAuthService,
    AdminOnlyGuard,
    CompanyAuthService,
    CompanyOnlyGuard,
    CourierAuthService,
    CourierOnlyGuard,
  ],
})
export class AuthModule {}