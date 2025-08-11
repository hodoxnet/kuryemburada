import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { RegisterCourierDto } from './dto/register-courier.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  async login(@Body() loginDto: { email: string; password: string }) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'User registration' })
  async register(
    @Body()
    registerDto: {
      email: string;
      password: string;
      role: UserRole;
    },
  ) {
    return this.authService.register(registerDto);
  }

  @Post('register/courier')
  @UseInterceptors(FilesInterceptor('documents', 10))
  @ApiOperation({ summary: 'Courier registration with documents' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'string',
          description: 'JSON string of courier registration data' 
        },
        documents: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Document files (identity, license, etc.)'
        }
      },
      required: ['data'],
    }
  })
  async registerCourier(
    @Body('data') dataString: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const registerCourierDto: RegisterCourierDto = JSON.parse(dataString);
    return this.authService.registerCourier(registerCourierDto, files);
  }

  @Post('register/company')
  @UseInterceptors(FilesInterceptor('documents', 10))
  @ApiOperation({ summary: 'Company registration with documents' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        data: { 
          type: 'string',
          description: 'JSON string of company registration data' 
        },
        documents: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          description: 'Document files (tax certificate, trade license, etc.)'
        }
      },
      required: ['data'],
    }
  })
  async registerCompany(
    @Body('data') dataString: string,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    const registerCompanyDto: RegisterCompanyDto = JSON.parse(dataString);
    return this.authService.registerCompany(registerCompanyDto, files);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password' })
  async changePassword(
    @Request() req,
    @Body()
    changePasswordDto: {
      oldPassword: string;
      newPassword: string;
    },
  ) {
    return this.authService.changePassword(
      req.user.id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify JWT token and get user info' })
  async verify(@Request() req) {
    return {
      valid: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() refreshDto: { refreshToken: string }) {
    return this.authService.refreshToken(refreshDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout and revoke all refresh tokens' })
  async logout(@Request() req) {
    return this.authService.logout(req.user.id);
  }
}