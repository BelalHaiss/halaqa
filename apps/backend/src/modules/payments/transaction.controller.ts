import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import type {
  CreateManualTransactionDto,
  FinancialTransactionSummaryDto,
  QueryTransactionsDto,
  QueryTransactionsResponseDto,
} from '@halaqa/shared';
import { createManualTransactionSchema, queryTransactionsSchema } from '@halaqa/shared';
import { UserRole, type User as UserEntity } from 'generated/prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { TransactionService } from './transaction.service';

@Controller('payments/transactions')
@Roles([UserRole.ADMIN, UserRole.MODERATOR])
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  queryTransactions(
    @User() actor: UserEntity,
    @Query(new ZodValidationPipe(queryTransactionsSchema('en')))
    query: QueryTransactionsDto
  ): Promise<QueryTransactionsResponseDto> {
    return this.transactionService.queryTransactions(actor, query);
  }

  @Post()
  createManualTransaction(
    @User() actor: UserEntity,
    @Body(new ZodValidationPipe(createManualTransactionSchema('en')))
    dto: CreateManualTransactionDto
  ): Promise<FinancialTransactionSummaryDto> {
    return this.transactionService.createManualTransaction(actor, dto);
  }

  @Delete(':id')
  @Roles([UserRole.ADMIN])
  deleteTransaction(@Param('id') id: string): Promise<void> {
    return this.transactionService.deleteTransaction(id);
  }
}
