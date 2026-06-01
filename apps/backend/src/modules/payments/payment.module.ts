import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentLabelController } from './payment-label.controller';
import { PaymentLabelService } from './payment-label.service';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  controllers: [PaymentController, PaymentLabelController, TransactionController],
  providers: [PaymentService, PaymentLabelService, TransactionService],
})
export class PaymentModule {}
