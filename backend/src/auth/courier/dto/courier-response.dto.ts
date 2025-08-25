import { ApiProperty } from '@nestjs/swagger';

export class CourierLoginResponseDto {
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
    description: 'Courier user information',
  })
  courier: {
    id: string;
    email: string;
    role: string;
    courier: {
      id: string;
      fullName: string;
      phone: string;
      status: string;
      vehicleInfo: any;
      licenseInfo: any;
    };
    createdAt: Date;
    lastLoginAt?: Date;
  };
}

export class CourierRegisterResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'Courier application submitted successfully. Waiting for approval.',
  })
  message: string;

  @ApiProperty({
    description: 'Courier information',
  })
  courier: {
    id: string;
    email: string;
    status: string;
    courier: {
      id: string;
      fullName: string;
      phone: string;
      status: string;
    };
  };
}

export class CourierRefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refreshToken: string;
}