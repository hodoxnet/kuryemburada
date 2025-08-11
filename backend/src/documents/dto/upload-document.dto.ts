import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '@prisma/client';

export class UploadDocumentDto {
  @ApiProperty({ 
    enum: DocumentType,
    description: 'Document type' 
  })
  @IsEnum(DocumentType)
  @IsNotEmpty()
  type: DocumentType;

  @ApiPropertyOptional({ description: 'User ID (if not the current user)' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ description: 'Additional description for the document' })
  @IsString()
  @IsOptional()
  description?: string;
}