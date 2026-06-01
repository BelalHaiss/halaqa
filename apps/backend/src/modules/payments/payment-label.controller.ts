import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type {
  CreateTransactionLabelDto,
  QueryTransactionLabelsDto,
  QueryTransactionLabelsResponseDto,
  TransactionLabelDto,
} from '@halaqa/shared';
import { createTransactionLabelSchema, queryTransactionLabelsSchema } from '@halaqa/shared';
import { UserRole } from 'generated/prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { PaymentLabelService } from './payment-label.service';

@Controller('payments/labels')
@Roles([UserRole.ADMIN, UserRole.MODERATOR])
export class PaymentLabelController {
  constructor(private readonly paymentLabelService: PaymentLabelService) {}

  @Get()
  searchLabels(
    @Query(new ZodValidationPipe(queryTransactionLabelsSchema()))
    query: QueryTransactionLabelsDto
  ): Promise<QueryTransactionLabelsResponseDto> {
    return this.paymentLabelService.searchLabels(query);
  }

  @Post()
  createLabel(
    @Body(new ZodValidationPipe(createTransactionLabelSchema('en')))
    dto: CreateTransactionLabelDto
  ): Promise<TransactionLabelDto> {
    return this.paymentLabelService.createLabel(dto);
  }
}
