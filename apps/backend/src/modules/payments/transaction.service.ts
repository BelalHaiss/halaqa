import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CreateManualTransactionDto,
  DateRangeQueryType,
  FinancialTransactionSummaryDto,
  ISODateString,
  QueryTransactionsDto,
  QueryTransactionsResponseDto,
  TransactionLabelDto,
} from '@halaqa/shared';
import { normalizeArabic } from '@halaqa/shared';
import {
  CurrencyCode,
  Prisma,
  TransactionEntityType as DbTransactionEntityType,
  TransactionType as DbTransactionType,
  User,
} from 'generated/prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class TransactionService {
  constructor(private readonly prismaService: DatabaseService) {}

  async queryTransactions(
    actor: User,
    query: QueryTransactionsDto
  ): Promise<QueryTransactionsResponseDto> {
    const { skip, take, page } = this.prismaService.handleQueryPagination(query);
    const dateFilter = this.prismaService.handleDateRangeFilter(
      query as DateRangeQueryType,
      actor.timezone
    );

    const where: Prisma.FinancialTransactionWhereInput = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...(query.currency ? { currency: query.currency } : {}),
      ...(query.labelId ? { labelId: query.labelId } : {}),
      ...(dateFilter ? { createdAt: dateFilter } : {}),
    };

    const orderBy = this.buildOrderBy(query.sortBy, query.sortOrder);

    const [rows, count] = await this.prismaService.$transaction([
      this.prismaService.financialTransaction.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          label: true,
          createdBy: { select: { id: true, name: true } },
        },
      }),
      this.prismaService.financialTransaction.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toSummaryDto(row)),
      ...this.prismaService.formatPaginationResponse({ page, count, limit: take }),
    };
  }

  async createManualTransaction(
    actor: User,
    dto: CreateManualTransactionDto
  ): Promise<FinancialTransactionSummaryDto> {
    const created = await this.prismaService.$transaction(async (tx) => {
      let resolvedLabelId: string | undefined;

      if (dto.newLabelName) {
        const label = await tx.transactionLabel.create({
          data: {
            name: dto.newLabelName,
            nameNormalized: normalizeArabic(dto.newLabelName),
          },
        });
        resolvedLabelId = label.id;
      } else if (dto.labelId) {
        resolvedLabelId = dto.labelId;
      }

      return tx.financialTransaction.create({
        data: {
          type: dto.type,
          amount: dto.amount,
          currency: dto.currency,
          entityType: 'MANUAL',
          labelId: resolvedLabelId ?? null,
          notes: dto.notes ?? null,
          createdById: actor.id,
        },
        include: {
          label: true,
          createdBy: { select: { id: true, name: true } },
        },
      });
    });

    return this.toSummaryDto(created);
  }

  async deleteTransaction(id: string): Promise<void> {
    const transaction = await this.prismaService.financialTransaction.findUnique({
      where: { id },
      select: { entityType: true },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.entityType !== 'MANUAL') {
      throw new ForbiddenException('Only manual transactions can be deleted');
    }

    await this.prismaService.financialTransaction.delete({ where: { id } });
  }

  private buildOrderBy(
    sortBy?: string,
    sortOrder?: string
  ): Prisma.FinancialTransactionOrderByWithRelationInput {
    const order = (sortOrder ?? 'desc') as Prisma.SortOrder;
    switch (sortBy) {
      case 'amount':
        return { amount: order };
      case 'currency':
        return { currency: order };
      case 'createdAt':
      default:
        return { createdAt: order };
    }
  }

  private toSummaryDto(row: {
    id: string;
    type: DbTransactionType;
    entityType: DbTransactionEntityType;
    amount: Prisma.Decimal;
    currency: CurrencyCode;
    labelId: string | null;
    notes: string | null;
    learnerPaymentId: string | null;
    tutorPaymentId: string | null;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    label: { id: string; name: string; createdAt: Date } | null;
    createdBy: { id: string; name: string };
  }): FinancialTransactionSummaryDto {
    return {
      id: row.id,
      type: row.type,
      entityType: row.entityType,
      amount: Number(row.amount),
      currency: row.currency,
      labelId: row.labelId ?? undefined,
      label: row.label
        ? ({
            id: row.label.id,
            name: row.label.name,
            createdAt: row.label.createdAt.toISOString() as ISODateString,
          } satisfies TransactionLabelDto)
        : undefined,
      notes: row.notes ?? undefined,
      learnerPaymentId: row.learnerPaymentId ?? undefined,
      tutorPaymentId: row.tutorPaymentId ?? undefined,
      createdById: row.createdById,
      createdByName: row.createdBy.name,
      createdAt: row.createdAt.toISOString() as ISODateString,
      updatedAt: row.updatedAt.toISOString() as ISODateString,
    };
  }
}
