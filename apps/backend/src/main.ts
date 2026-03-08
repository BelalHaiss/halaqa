import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import {
  HttpExceptionFilter,
  PrismaExceptionFilter,
  UncaughtExceptionFilter,
  ZodExceptionFilter,
} from './exceptions/exception';
import { AppLogger } from './modules/logging/app-logger.service';
import { isDevelopment } from './utils/util';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
  const appLogger = app.get(AppLogger);
  app.useLogger(appLogger);
  app.set('trust proxy', 'loopback');
  if (isDevelopment) {
    app.enableCors({
      origin: '*', // Adjust this to your frontend URL and port
    });
  }
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(
    new UncaughtExceptionFilter(appLogger),
    new PrismaExceptionFilter(appLogger),
    new ZodExceptionFilter(appLogger),
    new HttpExceptionFilter(appLogger)
  );
  await app.listen(process.env.PORT ?? 5000);
}
void bootstrap();
