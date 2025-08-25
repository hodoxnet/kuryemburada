import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({
    description: 'Admin email adresi',
    example: 'admin@kuryem.com',
  })
  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Email adresi boş olamaz' })
  email: string;

  @ApiProperty({
    description: 'Admin şifresi',
    example: 'admin123',
    minLength: 6,
  })
  @IsString({ message: 'Şifre metin türünde olmalıdır' })
  @IsNotEmpty({ message: 'Şifre boş olamaz' })
  @MinLength(6, { message: 'Şifre en az 6 karakter olmalıdır' })
  password: string;
}