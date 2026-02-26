import { Module } from '@nestjs/common';
import { LoggingModule } from '../logging/logging.module';
import { ObservabilityController } from './observability.controller';

@Module({
  imports: [LoggingModule],
  controllers: [ObservabilityController],
})
export class ObservabilityModule {}
