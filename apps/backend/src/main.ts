import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import {
  UncaughtExceptionFilter,
  HttpExceptionFilter,
  ZodExceptionFilter,
  PrismaExceptionFilter,
} from './exceptions/exception';
import { isDevelopment } from './utils/util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  if (isDevelopment) {
    app.enableCors({
      origin: '*', // Adjust this to your frontend URL and port
    });
  }
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(
    new UncaughtExceptionFilter(),
    new HttpExceptionFilter(),
    new ZodExceptionFilter(),
    new PrismaExceptionFilter(),
  );
  await app.listen(process.env.PORT ?? 5000);
}
void bootstrap();
