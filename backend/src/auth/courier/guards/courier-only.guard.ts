import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class CourierOnlyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
      throw new ForbiddenException('User authentication not completed');
    }

    if (user.role !== UserRole.COURIER) {
      throw new ForbiddenException('This operation can only be performed by couriers');
    }

    return true;
  }
}