import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Query, 
  UseGuards,
  Request,
  Patch,
  Delete,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, OrderStatus } from '@prisma/client';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Yeni sipariş oluştur (Firma)' })
  @ApiResponse({ status: 201, description: 'Sipariş başarıyla oluşturuldu' })
  @ApiResponse({ status: 403, description: 'Firma onaylı değil' })
  async createOrder(
    @Request() req,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const company = await this.getCompanyFromUser(req.user.id);
    return this.ordersService.createOrder(company.id, createOrderDto);
  }

  @Get('company')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Firma siparişlerini listele' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'startDate', required: false, type: Date })
  @ApiQuery({ name: 'endDate', required: false, type: Date })
  async getCompanyOrders(
    @Request() req,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('status') status?: OrderStatus,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const company = await this.getCompanyFromUser(req.user.id);
    return this.ordersService.getCompanyOrders(company.id, {
      skip,
      take,
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Get('available')
  @Roles(UserRole.COURIER)
  @ApiOperation({ summary: 'Müsait siparişleri listele (Kurye havuzu)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  async getAvailableOrders(
    @Request() req,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ) {
    const courier = await this.getCourierFromUser(req.user.id);
    return this.ordersService.getAvailableOrders(courier.id, { skip, take });
  }

  @Get('courier')
  @Roles(UserRole.COURIER)
  @ApiOperation({ summary: 'Kuryenin siparişlerini listele' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  async getCourierOrders(
    @Request() req,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('status') status?: OrderStatus,
  ) {
    const courier = await this.getCourierFromUser(req.user.id);
    return this.ordersService.getCourierOrders(courier.id, { skip, take, status });
  }

  @Get('courier/statistics')
  @Roles(UserRole.COURIER)
  @ApiOperation({ summary: 'Kurye istatistiklerini getir' })
  @ApiResponse({ status: 200, description: 'Kurye istatistikleri' })
  async getCourierStatistics(@Request() req) {
    const courier = await this.getCourierFromUser(req.user.id);
    return this.ordersService.getCourierStatistics(courier.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Sipariş detayını getir' })
  @ApiResponse({ status: 200, description: 'Sipariş detayı' })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  async getOrderById(@Request() req, @Param('id') id: string) {
    // Sipariş detayına erişim kontrolü
    // SUPER_ADMIN herşeyi görebilir
    // COMPANY sadece kendi siparişlerini görebilir
    // COURIER sadece kendine atanan siparişleri görebilir
    return this.ordersService.getOrderByIdWithAuth(id, req.user);
  }

  @Post(':id/accept')
  @Roles(UserRole.COURIER)
  @ApiOperation({ summary: 'Siparişi kabul et (Kurye)' })
  @ApiResponse({ status: 200, description: 'Sipariş kabul edildi' })
  @ApiResponse({ status: 400, description: 'Sipariş zaten alınmış' })
  async acceptOrder(
    @Request() req,
    @Param('id') id: string,
  ) {
    const courier = await this.getCourierFromUser(req.user.id);
    return this.ordersService.acceptOrder(id, courier.id);
  }

  @Patch(':id/status')
  @Roles(UserRole.COURIER)
  @ApiOperation({ summary: 'Sipariş durumunu güncelle (Kurye)' })
  @ApiResponse({ status: 200, description: 'Sipariş durumu güncellendi' })
  @ApiResponse({ status: 403, description: 'Bu sipariş size ait değil' })
  async updateOrderStatus(
    @Request() req,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const courier = await this.getCourierFromUser(req.user.id);
    return this.ordersService.updateOrderStatus(
      id, 
      courier.id, 
      updateOrderStatusDto.status,
      {
        deliveryProof: updateOrderStatusDto.deliveryProof,
        cancellationReason: updateOrderStatusDto.cancellationReason,
      }
    );
  }

  @Post(':id/cancel')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Siparişi iptal et (Firma)' })
  @ApiResponse({ status: 200, description: 'Sipariş iptal edildi' })
  @ApiResponse({ status: 400, description: 'Sipariş iptal edilemez' })
  async cancelOrder(
    @Request() req,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    const company = await this.getCompanyFromUser(req.user.id);
    return this.ordersService.cancelOrder(id, company.id, reason);
  }

  @Post(':id/rate')
  @Roles(UserRole.COMPANY)
  @ApiOperation({ summary: 'Siparişi değerlendir (Firma)' })
  @ApiResponse({ status: 200, description: 'Sipariş değerlendirildi' })
  @ApiResponse({ status: 400, description: 'Sipariş zaten değerlendirilmiş' })
  async rateOrder(
    @Request() req,
    @Param('id') id: string,
    @Body('rating', ParseIntPipe) rating: number,
    @Body('feedback') feedback?: string,
  ) {
    const company = await this.getCompanyFromUser(req.user.id);
    return this.ordersService.rateOrder(id, company.id, rating, feedback);
  }

  // Yardımcı metodlar
  private async getCompanyFromUser(userId: string) {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const company = await prisma.company.findUnique({
      where: { userId },
    });
    if (!company) {
      throw new Error('Firma bulunamadı');
    }
    return company;
  }

  private async getCourierFromUser(userId: string) {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const courier = await prisma.courier.findUnique({
      where: { userId },
    });
    if (!courier) {
      throw new Error('Kurye bulunamadı');
    }
    return courier;
  }
}
