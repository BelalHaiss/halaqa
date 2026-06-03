import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionController } from './session.controller';
import { PaymentModule } from '../payments/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [SessionController],
  providers: [SessionService],
})
export class SessionModule {}
