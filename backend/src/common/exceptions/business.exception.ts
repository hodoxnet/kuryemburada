import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(message: string, statusCode: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(
      {
        statusCode,
        message,
        error: 'Business Error',
        timestamp: new Date().toISOString(),
      },
      statusCode,
    );
  }
}

export class ValidationException extends HttpException {
  constructor(errors: any) {
    super(
      {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        message: 'Validation failed',
        error: 'Validation Error',
        errors,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

export class NotFoundException extends HttpException {
  constructor(entity: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: `${entity} not found`,
        error: 'Not Found',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ConflictException extends HttpException {
  constructor(message: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message,
        error: 'Conflict',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.CONFLICT,
    );
  }
}