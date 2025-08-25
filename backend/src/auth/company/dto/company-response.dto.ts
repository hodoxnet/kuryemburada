import { ApiProperty } from '@nestjs/swagger';

export class CompanyLoginResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;

  @ApiProperty({
    description: 'Company user information',
  })
  company: {
    id: string;
    email: string;
    role: string;
    company: {
      id: string;
      name: string;
      phone: string;
      status: string;
      address: any;
      contactPerson: any;
    };
    createdAt: Date;
    lastLoginAt?: Date;
  };
}

export class CompanyRegisterResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Company registration successful. Waiting for approval.',
  })
  message: string;

  @ApiProperty({
    description: 'Company information',
  })
  company: {
    id: string;
    email: string;
    status: string;
    company: {
      id: string;
      name: string;
      phone: string;
      status: string;
    };
  };
}

export class CompanyRefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}