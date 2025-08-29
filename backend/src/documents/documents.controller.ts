import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  Query,
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

  @Get(':id/view')
  @ApiOperation({ summary: 'View document file (inline)' })
  async viewDocument(
    @Param('id') id: string, 
    @Query('token') token: string,
    @Res() res: Response
  ) {
    try {
      // Token ile kullanıcıyı doğrula
      const user = await this.documentsService.validateTokenAndGetUser(token);
      
      const fileData = await this.documentsService.getDocumentFile(id, user.id);
      
      if (!fileData?.buffer || fileData.buffer.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Document file not found or empty',
        });
      }
      
      res.set({
        'Content-Type': fileData.mimeType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${fileData.fileName}"`,
        'Content-Length': fileData.buffer.length.toString(),
        'Cache-Control': 'private, max-age=3600',
      });
      
      res.status(HttpStatus.OK).end(fileData.buffer);
    } catch (error) {
      console.error('Error viewing document:', error);
      
      // Response zaten gönderilmişse tekrar gönderme
      if (res.headersSent) {
        console.error('Headers already sent, cannot send error response');
        return;
      }
      
      if (error.name === 'UnauthorizedException') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Authentication required',
        });
      }
      
      if (error.name === 'NotFoundException') {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Document not found',
        });
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error retrieving document',
      });
    }
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download document file' })
  async downloadDocument(
    @Param('id') id: string, 
    @Query('token') token: string,
    @Res() res: Response
  ) {
    try {
      // Token ile kullanıcıyı doğrula
      const user = await this.documentsService.validateTokenAndGetUser(token);
      
      const fileData = await this.documentsService.getDocumentFile(id, user.id);
      
      if (!fileData?.buffer || fileData.buffer.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Document file not found or empty',
        });
      }
      
      res.set({
        'Content-Type': fileData.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileData.fileName}"`,
        'Content-Length': fileData.buffer.length.toString(),
      });
      
      res.status(HttpStatus.OK).end(fileData.buffer);
    } catch (error) {
      console.error('Error downloading document:', error);
      
      // Response zaten gönderilmişse tekrar gönderme
      if (res.headersSent) {
        console.error('Headers already sent, cannot send error response');
        return;
      }
      
      if (error.name === 'UnauthorizedException') {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Authentication required',
        });
      }
      
      if (error.name === 'NotFoundException') {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Document not found',
        });
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error downloading document',
      });
    }
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

  @Get(':id/admin-download')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Download document file (Admin only)' })
  async adminDownloadDocument(
    @Param('id') id: string,
    @Request() req,
    @Res() res: Response
  ) {
    try {
      const fileData = await this.documentsService.getDocumentFile(id, req.user.id);
      
      if (!fileData?.buffer || fileData.buffer.length === 0) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Document file not found or empty',
        });
      }
      
      res.set({
        'Content-Type': fileData.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${fileData.fileName}"`,
        'Content-Length': fileData.buffer.length.toString(),
      });
      
      res.status(HttpStatus.OK).end(fileData.buffer);
    } catch (error) {
      console.error('Error downloading document (admin):', error);
      
      if (res.headersSent) {
        console.error('Headers already sent, cannot send error response');
        return;
      }
      
      if (error.name === 'NotFoundException') {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Document not found',
        });
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error downloading document',
      });
    }
  }

  @Post('upload-for-user/:userId')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ 
    summary: 'Upload document for specific user (for application process)',
    description: 'Special endpoint for uploading documents during application process before user login'
  })
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
            'TAX_CERTIFICATE',
            'TRADE_LICENSE',
            'KEP_ADDRESS',
            'OTHER',
          ],
        },
        description: {
          type: 'string',
          description: 'Document description',
        },
      },
      required: ['file', 'type'],
    },
  })
  async uploadDocumentForUser(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
  ) {
    return this.documentsService.uploadDocument(
      file,
      uploadDocumentDto,
      userId,
    );
  }
}