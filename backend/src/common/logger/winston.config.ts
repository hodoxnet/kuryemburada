import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6,
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'cyan',
  debug: 'blue',
  silly: 'grey',
};

winston.addColors(logColors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, context, trace }) => {
    return `${timestamp} [${context || 'Application'}] ${level}: ${message}${
      trace ? `\n${trace}` : ''
    }`;
  }),
);

export const createWinstonLogger = (appName: string = 'KuryeOperasyon') => {
  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.LOG_LEVEL || 'info',
    }),
  ];

  if (process.env.NODE_ENV === 'production') {
    transports.push(
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format,
      }),
      new winston.transports.File({
        filename: 'logs/combined.log',
        format,
      }),
    );
  }

  return WinstonModule.createLogger({
    levels: logLevels,
    format,
    defaultMeta: { service: appName },
    transports,
    exitOnError: false,
  });
};