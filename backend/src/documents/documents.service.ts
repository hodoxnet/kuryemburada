import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType, DocumentStatus } from '@prisma/client';
import { UploadDocumentDto } from './dto/upload-document.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

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

    // Türkçe karakterleri temizle ve güvenli dosya adı oluştur
    const cleanOriginalName = this.sanitizeFileName(file.originalname);
    
    // Veritabanına kaydet
    const document = await this.prisma.document.create({
      data: {
        entityType: entityType || 'user',
        entityId: entityId,
        courierId: courierId,
        companyId: companyId,
        type: uploadDocumentDto.type,
        fileUrl: fileUrl,
        fileName: cleanOriginalName,
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

  async validateTokenAndGetUser(token: string) {
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      // JWT token'ını doğrula
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });

      // Kullanıcıyı veritabanından getir
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
        },
      });

      if (!user || user.status !== 'ACTIVE') {
        throw new UnauthorizedException('Invalid token');
      }

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getDocumentFile(documentId: string, requestingUserId?: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        courier: {
          include: { user: true }
        },
        company: {
          include: { user: true }
        }
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Yetki kontrolü: Kullanıcı sadece kendi belgelerini görebilir (admin hariç)
    if (requestingUserId) {
      const requestingUser = await this.prisma.user.findUnique({
        where: { id: requestingUserId },
      });

      const isOwner = (document.courier?.user?.id === requestingUserId) || 
                     (document.company?.user?.id === requestingUserId);
      const isAdmin = requestingUser?.role === 'SUPER_ADMIN';

      if (!isOwner && !isAdmin) {
        throw new NotFoundException('Document not found');
      }
    }

    try {
      const filePath = path.join(process.cwd(), document.fileUrl);
      
      // Dosyanın var olup olmadığını kontrol et
      await fs.access(filePath);
      
      const fileBuffer = await fs.readFile(filePath);
      
      if (!fileBuffer || fileBuffer.length === 0) {
        throw new NotFoundException('Document file is empty');
      }
      
      return {
        buffer: fileBuffer,
        mimeType: document.mimeType,
        fileName: document.fileName,
      };
    } catch (error) {
      console.error('Error reading document file:', error);
      
      if (error.code === 'ENOENT') {
        throw new NotFoundException('Document file not found on disk');
      }
      
      throw new NotFoundException('Document file could not be read');
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

  /**
   * Türkçe karakterleri ve özel karakterleri temizleyerek güvenli dosya adı oluşturur
   */
  private sanitizeFileName(fileName: string): string {
    // Türkçe karakter dönüşümleri
    const turkishChars: Record<string, string> = {
      'ç': 'c', 'Ç': 'C',
      'ğ': 'g', 'Ğ': 'G', 
      'ı': 'i', 'I': 'I',
      'İ': 'I', 'i': 'i',
      'ö': 'o', 'Ö': 'O',
      'ş': 's', 'Ş': 'S',
      'ü': 'u', 'Ü': 'U'
    };

    let cleanName = fileName;
    
    // Türkçe karakterleri değiştir
    for (const [turkish, english] of Object.entries(turkishChars)) {
      cleanName = cleanName.replace(new RegExp(turkish, 'g'), english);
    }
    
    // Diğer özel karakterleri temizle (alfanumerik, nokta, tire, alt çizgi hariç)
    cleanName = cleanName.replace(/[^a-zA-Z0-9.\-_\s]/g, '');
    
    // Boşlukları tire ile değiştir
    cleanName = cleanName.replace(/\s+/g, '-');
    
    // Çoklu tireleri tek tireye çevir
    cleanName = cleanName.replace(/-+/g, '-');
    
    // Başındaki ve sonundaki tireleri kaldır
    cleanName = cleanName.replace(/^-+|-+$/g, '');
    
    // Dosya adının çok uzun olmasını engelle (100 karakter max)
    if (cleanName.length > 100) {
      const ext = path.extname(cleanName);
      const nameWithoutExt = cleanName.substring(0, cleanName.lastIndexOf('.'));
      cleanName = nameWithoutExt.substring(0, 100 - ext.length) + ext;
    }
    
    return cleanName || 'belge'; // Boş isim durumunda varsayılan isim
  }
}