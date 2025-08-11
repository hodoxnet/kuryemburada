import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType, DocumentStatus } from '@prisma/client';
import { UploadDocumentDto } from './dto/upload-document.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async uploadDocument(
    file: Express.Multer.File,
    uploadDocumentDto: UploadDocumentDto,
    currentUserId: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    // Dosya tipi kontrolü
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image and PDF files are allowed');
    }

    // Kullanıcı ID'sini belirle (admin başka kullanıcı için yükleyebilir)
    const targetUserId = uploadDocumentDto.userId || currentUserId;

    // Kullanıcının varlığını ve tipini kontrol et
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        courier: true,
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Upload dizinini oluştur
    const uploadDir = path.join(process.cwd(), 'uploads', 'documents', targetUserId);
    await fs.mkdir(uploadDir, { recursive: true });

    // Dosya adını oluştur (güvenlik için hash kullan)
    const fileHash = createHash('md5').update(file.buffer).digest('hex');
    const timestamp = Date.now();
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uploadDocumentDto.type}_${timestamp}_${fileHash}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Dosyayı kaydet
    await fs.writeFile(filePath, file.buffer);

    // Dosya URL'sini oluştur
    const fileUrl = `/uploads/documents/${targetUserId}/${fileName}`;

    // Kullanıcı tipine göre entity bilgilerini belirle
    const entityType = user.courier ? 'courier' : user.company ? 'company' : null;
    const entityId = user.courier?.id || user.company?.id || null;
    const courierId = user.courier?.id || null;
    const companyId = user.company?.id || null;

    // Veritabanına kaydet
    const document = await this.prisma.document.create({
      data: {
        entityType: entityType || 'user',
        entityId: entityId,
        courierId: courierId,
        companyId: companyId,
        type: uploadDocumentDto.type,
        fileUrl: fileUrl,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        status: DocumentStatus.PENDING,
      },
    });

    return {
      id: document.id,
      type: document.type,
      fileName: document.fileName,
      status: document.status,
      uploadedAt: document.createdAt,
    };
  }

  async getDocumentsByUser(userId: string) {
    // Önce kullanıcının courier veya company bilgisini al
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        courier: true,
        company: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Kullanıcı tipine göre belgeleri getir
    const documents = await this.prisma.document.findMany({
      where: {
        OR: [
          { courierId: user.courier?.id },
          { companyId: user.company?.id },
        ].filter(condition => condition.courierId || condition.companyId),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        fileName: true,
        fileSize: true,
        status: true,
        verifiedAt: true,
        rejectionReason: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return documents;
  }

  async getDocument(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        courier: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
        company: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async verifyDocument(documentId: string, verifiedBy: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.APPROVED,
        verifiedAt: new Date(),
        verifiedBy,
      },
    });
  }

  async rejectDocument(documentId: string, reason: string, rejectedBy: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        status: DocumentStatus.REJECTED,
        rejectionReason: reason,
      },
    });
  }

  async deleteDocument(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Fiziksel dosyayı sil
    try {
      const filePath = path.join(process.cwd(), document.fileUrl);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }

    // Veritabanından sil
    await this.prisma.document.delete({
      where: { id: documentId },
    });

    return { message: 'Document deleted successfully' };
  }

  async getDocumentFile(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    try {
      const filePath = path.join(process.cwd(), document.fileUrl);
      const fileBuffer = await fs.readFile(filePath);
      return {
        buffer: fileBuffer,
        mimeType: document.mimeType,
        fileName: document.fileName,
      };
    } catch (error) {
      throw new NotFoundException('Document file not found');
    }
  }

  async getDocumentsByType(userId: string, type: DocumentType) {
    // Önce kullanıcının courier veya company bilgisini al
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        courier: true,
        company: true,
      },
    });

    if (!user) {
      return [];
    }

    return this.prisma.document.findMany({
      where: {
        type,
        OR: [
          { courierId: user.courier?.id },
          { companyId: user.company?.id },
        ].filter(condition => condition.courierId || condition.companyId),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getPendingDocuments() {
    return this.prisma.document.findMany({
      where: {
        status: DocumentStatus.PENDING,
      },
      include: {
        courier: {
          select: {
            fullName: true,
            tcNumber: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
        company: {
          select: {
            name: true,
            taxNumber: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}