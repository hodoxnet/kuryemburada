import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { UploadDocumentDto } from './dto/upload-document.dto';

@ApiTags('Documents')
@Controller('documents')
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        type: {
          type: 'string',
          enum: [
            'IDENTITY_CARD',
            'DRIVER_LICENSE',
            'VEHICLE_REGISTRATION',
            'INSURANCE',
            'ADDRESS_PROOF',
            'CRIMINAL_RECORD',
            'HEALTH_REPORT',
            'TRADE_LICENSE',
            'TAX_CERTIFICATE',
            'KEP_ADDRESS',
            'OTHER',
          ],
        },
        userId: {
          type: 'string',
          description: 'Optional: User ID (for admin upload)',
        },
        description: {
          type: 'string',
          description: 'Optional: Document description',
        },
      },
      required: ['file', 'type'],
    },
  })
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @Request() req,
  ) {
    return this.documentsService.uploadDocument(
      file,
      uploadDocumentDto,
      req.user.id,
    );
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all documents for a user' })
  async getDocumentsByUser(@Param('userId') userId: string) {
    return this.documentsService.getDocumentsByUser(userId);
  }

  @Get('my-documents')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user documents' })
  async getMyDocuments(@Request() req) {
    return this.documentsService.getDocumentsByUser(req.user.id);
  }

  @Get('pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all pending documents (Admin only)' })
  async getPendingDocuments() {
    return this.documentsService.getPendingDocuments();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get document details' })
  async getDocument(@Param('id') id: string) {
    return this.documentsService.getDocument(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download document file' })
  async downloadDocument(@Param('id') id: string, @Res() res: Response) {
    const fileData = await this.documentsService.getDocumentFile(id);
    
    res.set({
      'Content-Type': fileData.mimeType,
      'Content-Disposition': `attachment; filename="${fileData.fileName}"`,
    });
    
    res.status(HttpStatus.OK).send(fileData.buffer);
  }

  @Put(':id/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Verify a document (Admin only)' })
  async verifyDocument(@Param('id') id: string, @Request() req) {
    return this.documentsService.verifyDocument(id, req.user.id);
  }

  @Put(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Reject a document (Admin only)' })
  async rejectDocument(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.documentsService.rejectDocument(id, reason, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Delete a document (Admin only)' })
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.deleteDocument(id);
  }
}