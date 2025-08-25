import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Get,
  Put,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CompanyAuthService } from './company-auth.service';
import { CompanyLoginDto } from './dto/company-login.dto';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { CompanyLoginResponseDto, CompanyRegisterResponseDto, CompanyRefreshTokenDto } from './dto/company-response.dto';
import { CoreJwtAuthGuard } from '../core/guards/jwt-auth.guard';
import { CompanyOnlyGuard } from './guards/company-only.guard';

@ApiTags('Company Authentication')
@Controller('auth/company')
export class CompanyAuthController {
  constructor(private companyAuthService: CompanyAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Company login',
    description: 'Login endpoint specifically for company users'
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: CompanyLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 403,
    description: 'Company not approved',
  })
  async login(@Body() loginDto: CompanyLoginDto) {
    return this.companyAuthService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Company registration',
    description: 'Register a new company account'
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: CompanyRegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Email already exists',
  })
  async register(@Body() registerDto: CompanyRegisterDto) {
    return this.companyAuthService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Company access token refresh',
    description: 'Get new access token using refresh token'
  })
  @ApiResponse({
    status: 200,
    description: 'Token refresh successful',
    type: CompanyLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refresh(@Body() refreshDto: CompanyRefreshTokenDto) {
    const tokens = await this.companyAuthService.refreshToken(refreshDto.refreshToken);
    
    if (!tokens) {
      throw new Error('Invalid refresh token');
    }

    return tokens;
  }

  @Post('logout')
  @UseGuards(CoreJwtAuthGuard, CompanyOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Company logout',
    description: 'Logout and revoke all company user sessions'
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  async logout(@Request() req) {
    await this.companyAuthService.logout(req.user.id);
    return { message: 'Logout successful' };
  }

  @Get('profile')
  @UseGuards(CoreJwtAuthGuard, CompanyOnlyGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Company profile information',
    description: 'Get logged-in company user profile information'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile information retrieved',
  })
  async getProfile(@Request() req) {
    return this.companyAuthService.getCompanyProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(CoreJwtAuthGuard, CompanyOnlyGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update company profile',
    description: 'Update company profile information'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async updateProfile(
    @Request() req,
    @Body() updateData: Partial<CompanyRegisterDto>
  ) {
    return this.companyAuthService.updateCompanyProfile(req.user.id, updateData);
  }

  @Get('stats')
  @UseGuards(CoreJwtAuthGuard, CompanyOnlyGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Company statistics',
    description: 'Get company dashboard statistics'
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved',
  })
  async getStats(@Request() req) {
    return this.companyAuthService.getCompanyStats(req.user.id);
  }

  @Post('change-password')
  @UseGuards(CoreJwtAuthGuard, CompanyOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Company password change',
    description: 'Change company user password'
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
  })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: {
      oldPassword: string;
      newPassword: string;
    },
  ) {
    await this.companyAuthService.changePassword(
      req.user.id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
    
    return { message: 'Password changed successfully' };
  }
}