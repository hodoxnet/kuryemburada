import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('Kullanıcı kimlik doğrulaması yapılmamış');
    }

    if (user.role !== UserRole.SUPER_ADMIN) {
      throw new ForbiddenException('Bu işlem sadece sistem yöneticileri tarafından yapılabilir');
    }

    return true;
  }
}