import {
  Catch,
  HttpException,
  ExceptionFilter,
  ArgumentsHost,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { isDevelopment } from 'src/utils/util';
import { ApiErrorResponse, getNowAsUTC } from '@halaqa/shared';
import { Prisma } from 'generated/prisma/client';
import { AppLogger } from 'src/modules/logging/app-logger.service';

// Error response type for exception handling

const extractRequestId = (request: Request): string | undefined => {
  const requestId = request.headers['x-request-id'];

  if (Array.isArray(requestId)) {
    return requestId[0];
  }

  return requestId;
};

const extractHttpExceptionMessage = (exception: HttpException): string => {
  const response = exception.getResponse();

  if (typeof response === 'string') {
    return response;
  }

  if (response && typeof response === 'object' && 'message' in response) {
    const message = (response as { message?: unknown }).message;

    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return exception.message || 'something went wrong';
};

@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly appLogger: AppLogger) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const message = extractHttpExceptionMessage(exception);

    const errorResponse: ApiErrorResponse = {
      timestamp: getNowAsUTC(),
      success: false,
      statusCode: status,
      path: request.url,
      message,
    };

    this.appLogger.logBackendError({
      source: 'backend',
      context: 'HttpExceptionFilter',
      message,
      timestamp: errorResponse.timestamp,
      statusCode: status,
      method: request.method,
      path: request.url,
      stack: exception.stack,
      requestId: extractRequestId(request),
      userId: request.user?.id,
    });

    response.status(status).json(errorResponse);
  }
}

@Injectable()
@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientUnknownRequestError,
  Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  constructor(private readonly appLogger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const defaultError: ApiErrorResponse = {
      timestamp: getNowAsUTC(),
      success: false,
      statusCode: HttpStatus.BAD_REQUEST,
      path: req.url,
      message: 'Invalid data or operation. Please check your input',
    };

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          defaultError.statusCode = HttpStatus.CONFLICT;
          defaultError.message = exception.message;
          if (exception.meta && exception.meta.target) {
            if (typeof exception.meta.target === 'string') {
              defaultError.message = `Unique constraint failed on the field: ${exception.meta.target}`;
              defaultError.fields = [
                {
                  field: exception.meta.target,
                  message: defaultError.message,
                },
              ];
            } else if (Array.isArray(exception.meta.target)) {
              const fields = exception.meta.target.join(', ');
              defaultError.message = `Unique constraint failed on the fields: ${fields}`;
              defaultError.fields = exception.meta.target.map((field) => ({
                field: String(field),
                message: `Unique constraint failed on: ${String(field)}`,
              }));
            }
          }
          break;
        case 'P2025':
          defaultError.statusCode = HttpStatus.NOT_FOUND;
          defaultError.message = 'Record not found';
          break;
        case 'P2003':
          defaultError.statusCode = HttpStatus.CONFLICT;
          defaultError.message = 'Invalid relation reference';
          break;
        case 'P2000':
          defaultError.statusCode = HttpStatus.BAD_REQUEST;
          defaultError.message = 'Value too long for column';
          break;
        case 'P2014':
          defaultError.statusCode = HttpStatus.CONFLICT;
          defaultError.message = 'Relation constraint failed';
          break;
        case 'P2024':
          defaultError.statusCode = HttpStatus.SERVICE_UNAVAILABLE;
          defaultError.message = 'Database connection timeout';
          break;
        default:
          defaultError.message = exception.message;
      }
    }

    this.appLogger.logBackendError({
      source: 'backend',
      context: 'PrismaExceptionFilter',
      message: defaultError.message,
      timestamp: defaultError.timestamp,
      statusCode: defaultError.statusCode,
      method: req.method,
      path: req.url,
      stack: exception instanceof Error ? exception.stack : undefined,
      requestId: extractRequestId(req),
      userId: req.user?.id,
    });

    return res.status(defaultError.statusCode).json(defaultError);
  }
}

@Injectable()
@Catch(ZodError)
export class ZodExceptionFilter implements ExceptionFilter {
  constructor(private readonly appLogger: AppLogger) {}

  catch(exception: ZodError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = HttpStatus.BAD_REQUEST;
    const errorResponse: ApiErrorResponse = {
      timestamp: getNowAsUTC(),
      success: false,
      statusCode: status,
      path: req.url,
      message: 'Validation failed',
      fields: exception.issues.map((iss) => ({
        field: iss.path.join('.'),
        message: isDevelopment ? iss.message : iss.code, // based on env we can switch to iss.message for more detailed info
      })),
    };

    this.appLogger.logBackendError({
      source: 'backend',
      context: 'ZodExceptionFilter',
      message: errorResponse.message,
      timestamp: errorResponse.timestamp,
      statusCode: status,
      method: req.method,
      path: req.url,
      stack: exception.stack,
      requestId: extractRequestId(req),
      userId: req.user?.id,
    });

    res.status(status).json(errorResponse);
  }
}

// catch remaing unhandled exceptions
@Injectable()
@Catch()
export class UncaughtExceptionFilter implements ExceptionFilter {
  constructor(private readonly appLogger: AppLogger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const internalMessage =
      exception instanceof Error ? exception.message : 'Internal server error';
    const message = isDevelopment ? internalMessage : 'Internal server error';

    const errorResponse: ApiErrorResponse = {
      timestamp: getNowAsUTC(),
      success: false,
      statusCode: status,
      path: req.url,
      message,
    };

    this.appLogger.logBackendError({
      source: 'backend',
      context: 'UncaughtExceptionFilter',
      message: internalMessage,
      timestamp: errorResponse.timestamp,
      statusCode: status,
      method: req.method,
      path: req.url,
      stack: exception instanceof Error ? exception.stack : undefined,
      requestId: extractRequestId(req),
      userId: req.user?.id,
    });

    return res.status(status).json(errorResponse);
  }
}
