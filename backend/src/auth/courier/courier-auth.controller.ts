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
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CourierAuthService } from './courier-auth.service';
import { CourierLoginDto } from './dto/courier-login.dto';
import { CourierRegisterDto } from './dto/courier-register.dto';
import { CourierLoginResponseDto, CourierRegisterResponseDto, CourierRefreshTokenDto } from './dto/courier-response.dto';
import { CoreJwtAuthGuard } from '../core/guards/jwt-auth.guard';
import { CourierOnlyGuard } from './guards/courier-only.guard';

@ApiTags('Courier Authentication')
@Controller('auth/courier')
export class CourierAuthController {
  constructor(private courierAuthService: CourierAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Courier login',
    description: 'Login endpoint specifically for courier users'
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: CourierLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 403,
    description: 'Courier not approved',
  })
  async login(@Body() loginDto: CourierLoginDto) {
    return this.courierAuthService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Courier registration',
    description: 'Register a new courier application'
  })
  @ApiResponse({
    status: 201,
    description: 'Registration successful',
    type: CourierRegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Email or TC number already exists',
  })
  async register(@Body() registerDto: CourierRegisterDto) {
    return this.courierAuthService.register(registerDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Courier access token refresh',
    description: 'Get new access token using refresh token'
  })
  @ApiResponse({
    status: 200,
    description: 'Token refresh successful',
    type: CourierLoginResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refresh(@Body() refreshDto: CourierRefreshTokenDto) {
    const tokens = await this.courierAuthService.refreshToken(refreshDto.refreshToken);
    
    if (!tokens) {
      throw new Error('Invalid refresh token');
    }

    return tokens;
  }

  @Post('logout')
  @UseGuards(CoreJwtAuthGuard, CourierOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Courier logout',
    description: 'Logout and revoke all courier user sessions'
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  async logout(@Request() req) {
    await this.courierAuthService.logout(req.user.id);
    return { message: 'Logout successful' };
  }

  @Get('profile')
  @UseGuards(CoreJwtAuthGuard, CourierOnlyGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Courier profile information',
    description: 'Get logged-in courier user profile information'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile information retrieved',
  })
  async getProfile(@Request() req) {
    return this.courierAuthService.getCourierProfile(req.user.id);
  }

  @Put('profile')
  @UseGuards(CoreJwtAuthGuard, CourierOnlyGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update courier profile',
    description: 'Update courier profile information'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async updateProfile(
    @Request() req,
    @Body() updateData: Partial<CourierRegisterDto>
  ) {
    return this.courierAuthService.updateCourierProfile(req.user.id, updateData);
  }

  @Get('stats')
  @UseGuards(CoreJwtAuthGuard, CourierOnlyGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Courier statistics',
    description: 'Get courier dashboard statistics'
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved',
  })
  async getStats(@Request() req) {
    return this.courierAuthService.getCourierStats(req.user.id);
  }

  @Patch('location')
  @UseGuards(CoreJwtAuthGuard, CourierOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Update courier location',
    description: 'Update current courier location for real-time tracking'
  })
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully',
  })
  async updateLocation(
    @Request() req,
    @Body() locationDto: {
      latitude: number;
      longitude: number;
    },
  ) {
    return this.courierAuthService.updateLocation(
      req.user.id,
      locationDto.latitude,
      locationDto.longitude,
    );
  }

  @Post('change-password')
  @UseGuards(CoreJwtAuthGuard, CourierOnlyGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Courier password change',
    description: 'Change courier user password'
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
    await this.courierAuthService.changePassword(
      req.user.id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
    
    return { message: 'Password changed successfully' };
  }
}