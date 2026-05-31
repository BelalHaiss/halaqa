import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import type {
  ApplyLearnerPaymentDto,
  CreateLearnerPaymentDto,
  CreateTutorPaymentDto,
  LearnerPaymentSummaryDto,
  PreviewTutorPaymentDto,
  QueryLearnerPaymentsDto,
  QueryLearnerPaymentsResponseDto,
  QueryTutorPaymentsDto,
  QueryTutorPaymentsResponseDto,
  TutorLatestAllowedDateDto,
  TutorPaymentSummaryDto,
  TutorPaymentPreviewDto,
} from '@halaqa/shared';
import {
  applyLearnerPaymentSchema,
  createLearnerPaymentSchema,
  createTutorPaymentSchema,
  previewTutorPaymentSchema,
  queryLearnerPaymentsSchema,
  queryTutorPaymentsSchema,
} from '@halaqa/shared';
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

  @Post('learner/:id/pay')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  applyLearnerPayment(
    @User() actor: UserEntity,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(applyLearnerPaymentSchema('en')))
    dto: ApplyLearnerPaymentDto
  ): Promise<LearnerPaymentSummaryDto> {
    return this.paymentService.applyLearnerPayment(actor, id, dto);
  }

  @Delete('learner/:id')
  @Roles([UserRole.ADMIN])
  async deleteLearnerPayment(@User() actor: UserEntity, @Param('id') id: string): Promise<void> {
    await this.paymentService.deleteLearnerPayment(actor, id);
  }

  @Get('tutor')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.TUTOR])
  queryTutorPayments(
    @User() actor: UserEntity,
    @Query(new ZodValidationPipe(queryTutorPaymentsSchema('en')))
    query: QueryTutorPaymentsDto
  ): Promise<QueryTutorPaymentsResponseDto> {
    return this.paymentService.queryTutorPayments(actor, query);
  }

  @Get('tutor/:id')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.TUTOR])
  getTutorPaymentDetails(
    @User() actor: UserEntity,
    @Param('id') id: string
  ): Promise<TutorPaymentSummaryDto> {
    return this.paymentService.getTutorPaymentDetails(actor, id);
  }

  @Get('tutor/:tutorId/latest-allowed-date')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.TUTOR])
  getTutorLatestAllowedDate(
    @User() actor: UserEntity,
    @Param('tutorId') tutorId: string
  ): Promise<TutorLatestAllowedDateDto> {
    return this.paymentService.getTutorLatestAllowedDate(actor, tutorId);
  }

  @Post('tutor/preview')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.TUTOR])
  previewTutorPayment(
    @User() actor: UserEntity,
    @Body(new ZodValidationPipe(previewTutorPaymentSchema('en')))
    dto: PreviewTutorPaymentDto
  ): Promise<TutorPaymentPreviewDto> {
    return this.paymentService.previewTutorPayment(actor, dto);
  }

  @Post('tutor')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  createTutorPayment(
    @User() actor: UserEntity,
    @Body(new ZodValidationPipe(createTutorPaymentSchema('en')))
    dto: CreateTutorPaymentDto
  ): Promise<TutorPaymentSummaryDto[]> {
    return this.paymentService.createTutorPayment(actor, dto);
  }

  @Delete('tutor/:id')
  @Roles([UserRole.ADMIN])
  async deleteTutorPayment(@User() actor: UserEntity, @Param('id') id: string): Promise<void> {
    await this.paymentService.deleteTutorPayment(actor, id);
  }
}
