import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminLoginResponseDto, AdminRefreshTokenDto } from './dto/admin-response.dto';
import { CoreJwtAuthGuard } from '../core/guards/jwt-auth.guard';
import { AdminOnlyGuard } from './guards/admin-only.guard';

@ApiTags('Admin Authentication')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Admin giriş işlemi',
    description: 'Sistem yöneticisi kullanıcıları için özel giriş endpoint\'i'
  })
  @ApiResponse({
    status: 200,
    description: 'Giriş başarılı',
    type: AdminLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Geçersiz kimlik bilgileri',
  })
  async login(@Body() loginDto: AdminLoginDto) {
    return this.adminAuthService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Admin access token yenileme',
    description: 'Refresh token ile yeni access token alır'
  })
  @ApiResponse({
    status: 200,
    description: 'Token yenileme başarılı',
    type: AdminLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Geçersiz refresh token',
  })
  async refresh(@Body() refreshDto: AdminRefreshTokenDto) {
    const tokens = await this.adminAuthService.refreshToken(refreshDto.refreshToken);
    
    if (!tokens) {
      throw new Error('Geçersiz refresh token');
    }

    return tokens;
  }

  @Post('logout')
  @UseGuards(CoreJwtAuthGuard, AdminOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Admin çıkış işlemi',
    description: 'Admin kullanıcısının tüm oturumlarını sonlandırır'
  })
  @ApiResponse({
    status: 200,
    description: 'Çıkış başarılı',
  })
  async logout(@Request() req) {
    await this.adminAuthService.logout(req.user.id);
    return { message: 'Çıkış başarılı' };
  }

  @Get('profile')
  @UseGuards(CoreJwtAuthGuard, AdminOnlyGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Admin profil bilgileri',
    description: 'Giriş yapmış admin kullanıcısının profil bilgilerini getirir'
  })
  @ApiResponse({
    status: 200,
    description: 'Profil bilgileri alındı',
  })
  async getProfile(@Request() req) {
    return this.adminAuthService.getAdminProfile(req.user.id);
  }

  @Get('stats')
  @UseGuards(CoreJwtAuthGuard, AdminOnlyGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Sistem istatistikleri',
    description: 'Admin dashboard için sistem geneli istatistikleri getirir'
  })
  @ApiResponse({
    status: 200,
    description: 'İstatistikler alındı',
  })
  async getSystemStats(@Request() req) {
    return this.adminAuthService.getSystemStats();
  }

  @Post('change-password')
  @UseGuards(CoreJwtAuthGuard, AdminOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Admin şifre değiştirme',
    description: 'Admin kullanıcısının şifresini değiştirir'
  })
  @ApiResponse({
    status: 200,
    description: 'Şifre değiştirildi',
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: {
      oldPassword: string;
      newPassword: string;
    },
  ) {
    await this.adminAuthService.changePassword(
      req.user.id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
    
    return { message: 'Şifre başarıyla değiştirildi' };
  }
}