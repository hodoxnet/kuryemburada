import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, UserStatus } from '@prisma/client';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';

@ApiTags('Kullanıcı Yönetimi')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Yeni kullanıcı oluştur' })
  @ApiResponse({ status: 201, description: 'Kullanıcı oluşturuldu' })
  @ApiResponse({ status: 409, description: 'E-posta zaten kullanılıyor' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Tüm kullanıcıları listele' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false, enum: UserRole })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus })
  @ApiResponse({ status: 200, description: 'Kullanıcı listesi' })
  async findAll(
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
  ) {
    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    return this.usersService.findAll({
      skip,
      take,
      where,
    });
  }

  @Get('statistics')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kullanıcı istatistiklerini getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı istatistikleri' })
  async getStatistics() {
    return this.usersService.getStatistics();
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kullanıcı detayını getir' })
  @ApiResponse({ status: 200, description: 'Kullanıcı detayı' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get('email/:email')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'E-posta ile kullanıcı ara' })
  @ApiResponse({ status: 200, description: 'Kullanıcı detayı' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kullanıcı bilgilerini güncelle' })
  @ApiResponse({ status: 200, description: 'Kullanıcı güncellendi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  @ApiResponse({ status: 409, description: 'E-posta zaten kullanılıyor' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Post(':id/change-password')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kullanıcı şifresini değiştir' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        oldPassword: { type: 'string' },
        newPassword: { type: 'string', minLength: 8 },
      },
      required: ['oldPassword', 'newPassword'],
    },
  })
  @ApiResponse({ status: 200, description: 'Şifre değiştirildi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  @ApiResponse({ status: 409, description: 'Eski şifre hatalı' })
  async changePassword(
    @Param('id') id: string,
    @Body('oldPassword') oldPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.usersService.changePassword(id, oldPassword, newPassword);
  }

  @Post(':id/toggle-status')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kullanıcı durumunu değiştir (aktif/pasif)' })
  @ApiResponse({ status: 200, description: 'Durum değiştirildi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleStatus(id);
  }

  @Post(':id/block')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kullanıcıyı engelle' })
  @ApiResponse({ status: 200, description: 'Kullanıcı engellendi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async blockUser(@Param('id') id: string) {
    return this.usersService.blockUser(id);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Kullanıcıyı sil' })
  @ApiResponse({ status: 200, description: 'Kullanıcı silindi' })
  @ApiResponse({ status: 404, description: 'Kullanıcı bulunamadı' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}