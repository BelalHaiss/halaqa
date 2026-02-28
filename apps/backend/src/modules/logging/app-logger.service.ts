import { ConsoleLogger, Injectable } from '@nestjs/common';
import { getNowAsUTC } from '@halaqa/shared';
import fs from 'node:fs';
import path from 'node:path';
import winston, { type Logger as WinstonLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { type BackendErrorLogEvent, type ClientErrorLogEvent } from './logger.types';

type FileLogLevel = 'warn' | 'error';

type FileLogEvent = {
  message: unknown;
  stack?: string;
  [key: string]: unknown;
};

@Injectable()
export class AppLogger extends ConsoleLogger {
  private readonly fileLogger: WinstonLogger | null;

  constructor() {
    super('AppLogger');
    this.fileLogger = this.createFileLogger();
  }

  override warn(message: any, context?: string): void {
    super.warn(message, context);
    this.write('warn', {
      source: 'system',
      context,
      timestamp: getNowAsUTC(),
      message,
    });
  }

  override error(message: any, stack?: string, context?: string): void {
    super.error(message, stack, context);
    this.write('error', {
      source: 'system',
      context,
      timestamp: getNowAsUTC(),
      message,
      stack,
    });
  }

  logBackendError(event: BackendErrorLogEvent): void {
    super.error(event.message, event.stack, event.context);
    this.write('error', event);
  }

  logClientError(event: ClientErrorLogEvent): void {
    super.warn(`[${event.captureChannel}] ${event.message}`, event.context);
    this.write('warn', event);
  }

  private createFileLogger(): WinstonLogger | null {
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }

    const logsDir = process.env.LOGS_DIR || path.join(__dirname, '..', '..', '..', '..', 'logs');
    fs.mkdirSync(logsDir, { recursive: true });

    const baseFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    );

    return winston.createLogger({
      level: 'warn',
      format: baseFormat,
      transports: [
        new DailyRotateFile({
          filename: path.join(logsDir, 'client-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxFiles: '14d',
          level: 'warn',
          format: winston.format((info) => (info.source === 'client' ? info : false))(),
        }),
        new DailyRotateFile({
          filename: path.join(logsDir, 'backend-%DATE%.log'),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxFiles: '14d',
          level: 'warn',
          format: winston.format((info) => (info.source !== 'client' ? info : false))(),
        }),
      ],
    });
  }

  private write(level: FileLogLevel, event: FileLogEvent): void {
    if (!this.fileLogger) {
      return;
    }

    const message = this.sanitizeText(this.toMessage(event.message), 3000);
    const stack =
      typeof event.stack === 'string' ? this.sanitizeText(event.stack, 8000) : undefined;

    this.fileLogger.log({
      level,
      ...event,
      message,
      ...(stack ? { stack } : {}),
    });
  }

  private toMessage(value: unknown): string {
    if (value instanceof Error) {
      return this.sanitizeText(value.message, 3000);
    }

    if (typeof value === 'string') {
      return this.sanitizeText(value, 3000);
    }

    try {
      return this.sanitizeText(JSON.stringify(value), 3000);
    } catch {
      return 'Unknown object error';
    }
  }

  private sanitizeText(value: string, maxLength: number): string {
    const trimmed = value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;

    return trimmed
      .replace(/(Bearer\s+)[\w.-]+/gi, '$1[REDACTED]')
      .replace(
        /(password|token|authorization|cookie|secret)\s*[:=]\s*([^\s,;]+)/gi,
        '$1=[REDACTED]'
      );
  }
}
