import { Body, Controller, Post, Req } from '@nestjs/common';
import {
  type ClientErrorLogDto,
  type ClientErrorLogResponseDto,
  getNowAsUTC,
} from '@halaqa/shared';
import type { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { IsPublic } from 'src/decorators/public.decorator';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { AppLogger } from '../logging/app-logger.service';
import { clientErrorLogSchema } from './validation/client-error.validation';

@Controller('observability')
@IsPublic()
@Throttle({ default: { limit: 20, ttl: 60000 } })
export class ObservabilityController {
  constructor(private readonly appLogger: AppLogger) {}

  @Post('client-errors')
  reportClientError(
    @Body(new ZodValidationPipe(clientErrorLogSchema))
    payload: ClientErrorLogDto,
    @Req() req: Request
  ): ClientErrorLogResponseDto {
    this.appLogger.logClientError({
      source: 'client',
      context: 'client-report',
      message: payload.message,
      timestamp: getNowAsUTC(),
      captureChannel: payload.captureChannel,
      path: payload.path,
      url: payload.url,
      userAgent: payload.userAgent,
      clientTimestamp: payload.timestamp,
      name: payload.name,
      stack: payload.stack,
      metadata: payload.metadata,
      ip: req.ip,
    });

    return { accepted: true };
  }
}
