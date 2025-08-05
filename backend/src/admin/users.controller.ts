import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
} from './dto/user-management.dto';

@ApiTags('Admin - Users')
@ApiBearerAuth()
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Tüm kullanıcıları listele' })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED'],
  })
  @ApiQuery({ name: 'email', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Kullanıcılar listelendi' })
  async findAll(
    @Query() filter: UserFilterDto,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.usersService.findAll(filter, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Kullanıcı detaylarını getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı detayları getirildi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur' })
  @ApiResponse({ status: 201, description: 'Kullanıcı oluşturuldu' })
  @ApiResponse({ status: 400, description: 'E-posta adresi zaten kullanımda' })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcıyı güncelle' })
  @ApiResponse({ status: 200, description: 'Kullanıcı güncellendi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcıyı sil' })
  @ApiResponse({ status: 200, description: 'Kullanıcı silindi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Put(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Kullanıcı şifresini sıfırla' })
  @ApiResponse({ status: 200, description: 'Şifre sıfırlandı' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: { newPassword: string },
  ) {
    return this.usersService.resetPassword(id, dto.newPassword);
  }

  @Get('statistics/overview')
  @ApiOperation({ summary: 'Kullanıcı istatistiklerini getir' })
  @ApiResponse({ status: 200, description: 'İstatistikler getirildi' })
  async getStatistics() {
    return this.usersService.getStatistics();
  }
}
