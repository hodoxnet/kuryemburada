import { Module, Global } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

const winstonLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        }),
      ),
    }),
  ],
});

@Global()
@Module({
  providers: [
    {
      provide: 'winston',
      useValue: winstonLogger,
    },
  ],
  exports: ['winston'],
})
export class LoggerModule {}