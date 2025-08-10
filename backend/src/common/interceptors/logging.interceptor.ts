import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;
    const userId = request.user?.id || 'anonymous';
    const now = Date.now();

    this.logger.log(
      `[${userId}] ${method} ${url} - Request body: ${JSON.stringify(body)}`,
    );

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const contentLength = JSON.stringify(data).length;
          
          this.logger.log(
            `[${userId}] ${method} ${url} - ${statusCode} - ${Date.now() - now}ms - ${contentLength} bytes`,
          );
        },
        error: (error) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = error.status || 500;
          
          this.logger.error(
            `[${userId}] ${method} ${url} - ${statusCode} - ${Date.now() - now}ms - Error: ${error.message}`,
          );
        },
      }),
    );
  }
}