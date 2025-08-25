import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CorePasswordService {
  private readonly saltRounds = 12;

  /**
   * Şifreyi hash'ler
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Şifreyi doğrular
   */
  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Şifre güçlülüğünü kontrol eder
   */
  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Şifre en az 8 karakter olmalıdır');
    }

    if (password.length > 128) {
      errors.push('Şifre en fazla 128 karakter olabilir');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Şifre en az bir küçük harf içermelidir');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Şifre en az bir büyük harf içermelidir');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Şifre en az bir rakam içermelidir');
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Şifre en az bir özel karakter içermelidir');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Geçici şifre üretir
   */
  generateTemporaryPassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    
    let password = '';
    
    // En az bir karakter her kategoriden
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Kalan karakterleri rastgele doldur
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Karakterleri karıştır
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}