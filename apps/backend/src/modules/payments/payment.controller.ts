import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import type {
  CreateLearnerPaymentDto,
  LearnerPaymentSummaryDto,
  QueryLearnerPaymentsDto,
  QueryLearnerPaymentsResponseDto,
} from '@halaqa/shared';
import { createLearnerPaymentSchema, queryLearnerPaymentsSchema } from '@halaqa/shared';
import { UserRole, type User as UserEntity } from 'generated/prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { PaymentService } from './payment.service';

@Controller('payments')
@Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.TUTOR, UserRole.STUDENT])
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('learner')
  queryLearnerPayments(
    @User() actor: UserEntity,
    @Query(new ZodValidationPipe(queryLearnerPaymentsSchema('en')))
    query: QueryLearnerPaymentsDto
  ): Promise<QueryLearnerPaymentsResponseDto> {
    return this.paymentService.queryLearnerPayments(actor, query);
  }

  @Get('learner/:id')
  getLearnerPaymentDetails(
    @User() actor: UserEntity,
    @Param('id') id: string
  ): Promise<LearnerPaymentSummaryDto> {
    return this.paymentService.getLearnerPaymentDetails(actor, id);
  }

  @Post('learner')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  createLearnerPayment(
    @User() actor: UserEntity,
    @Body(new ZodValidationPipe(createLearnerPaymentSchema('en')))
    dto: CreateLearnerPaymentDto
  ): Promise<LearnerPaymentSummaryDto> {
    return this.paymentService.createLearnerPayment(actor, dto);
  }

  @Delete('learner/:id')
  @Roles([UserRole.ADMIN])
  async deleteLearnerPayment(@User() actor: UserEntity, @Param('id') id: string): Promise<void> {
    await this.paymentService.deleteLearnerPayment(actor, id);
  }
}
