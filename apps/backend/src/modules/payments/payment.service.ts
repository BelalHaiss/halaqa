import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateLearnerPaymentDto,
  DateRangeQueryType,
  ISODateString,
  LearnerPaymentsSortBy,
  LearnerPaymentSummaryDto,
  QueryLearnerPaymentsDto,
  QueryLearnerPaymentsResponseDto,
  SortOrder,
  getStartAndEndOfDay,
} from '@halaqa/shared';
import {
  Prisma,
  User,
  UserRole,
  CurrencyCode,
  PaymentStatus as DbPaymentStatus,
  TransactionType as DbTransactionType,
  TransactionEntityType as DbTransactionEntityType,
} from 'generated/prisma/client';
import { DatabaseService } from '../database/database.service';
import {
  assertActorCanDeletePayments,
  assertActorCanManagePayments,
  assertDateRange,
} from './utils/payment.constraints';

@Injectable()
export class PaymentService {
  constructor(private readonly prismaService: DatabaseService) {}

  async queryLearnerPayments(
    actor: User,
    query: QueryLearnerPaymentsDto
  ): Promise<QueryLearnerPaymentsResponseDto> {
    const { skip, take, page } = this.prismaService.handleQueryPagination(query);
    const periodFromFilter = this.prismaService.handleDateRangeFilter(
      query as DateRangeQueryType,
      actor.timezone
    );

    const where: Prisma.LearnerPaymentWhereInput = {
      ...this.getLearnerPaymentsScope(actor),
      ...(query.learnerId ? { learnerId: query.learnerId } : {}),
      ...(query.groupId ? { groupId: query.groupId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.currency ? { currency: query.currency } : {}),
      ...(periodFromFilter ? { periodFrom: periodFromFilter } : {}),
    };

    const orderBy = this.getLearnerPaymentsOrderBy(query.sortBy, query.sortOrder);

    const [rows, count] = await this.prismaService.$transaction([
      this.prismaService.learnerPayment.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          learner: {
            select: {
              id: true,
              name: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
          transactions: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      }),
      this.prismaService.learnerPayment.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toLearnerPaymentSummaryDto(row)),
      ...this.prismaService.formatPaginationResponse({
        page,
        count,
        limit: take,
      }),
    };
  }

  async getLearnerPaymentDetails(actor: User, id: string): Promise<LearnerPaymentSummaryDto> {
    const row = await this.prismaService.learnerPayment.findFirst({
      where: {
        id,
        ...this.getLearnerPaymentsScope(actor),
      },
      include: {
        learner: {
          select: {
            id: true,
            name: true,
          },
        },
        group: {
          select: {
            id: true,
            name: true,
          },
        },
        transactions: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!row) {
      throw new NotFoundException('Learner payment not found');
    }

    return this.toLearnerPaymentSummaryDto(row);
  }

  async createLearnerPayment(
    actor: User,
    dto: CreateLearnerPaymentDto
  ): Promise<LearnerPaymentSummaryDto> {
    assertActorCanManagePayments(actor.role);
    assertDateRange(dto.periodFrom, dto.periodTo);

    const { startAsJSDate: periodFrom } = getStartAndEndOfDay('UTC', dto.periodFrom);
    const { endAsJSDate: periodTo } = getStartAndEndOfDay('UTC', dto.periodTo);

    const created = await this.prismaService.$transaction(async (tx) => {
      const learner = await tx.user.findFirst({
        where: {
          id: dto.learnerId,
          role: UserRole.STUDENT,
        },
        select: { id: true },
      });

      if (!learner) {
        throw new NotFoundException('Learner not found');
      }

      await this.assertGroupIsPaidAndLearnerEnrolled(tx, dto.groupId, dto.learnerId);

      const createdLearnerPayment = await tx.learnerPayment.create({
        data: {
          learnerId: dto.learnerId,
          groupId: dto.groupId,
          periodFrom,
          periodTo,
          totalAmount: dto.totalAmount,
          currency: dto.currency,
          status: 'PAID',
        },
      });

      await tx.financialTransaction.create({
        data: {
          type: 'INCOME',
          amount: dto.totalAmount,
          currency: dto.currency,
          entityType: 'LEARNER_PAYMENT',
          learnerPaymentId: createdLearnerPayment.id,
          createdById: actor.id,
        },
      });

      return createdLearnerPayment.id;
    });

    return this.getLearnerPaymentDetails(actor, created);
  }

  async deleteLearnerPayment(actor: User, id: string): Promise<void> {
    assertActorCanDeletePayments(actor.role);

    await this.prismaService.learnerPayment.delete({
      where: { id },
    });
  }

  private async assertGroupIsPaidAndLearnerEnrolled(
    tx: Prisma.TransactionClient,
    groupId: string,
    learnerId: string
  ): Promise<void> {
    const group = await tx.group.findFirst({
      where: {
        id: groupId,
        billingType: 'MONTHLY',
        students: {
          some: {
            userId: learnerId,
            leftAt: null,
          },
        },
      },
      select: { id: true },
    });

    if (!group) {
      throw new BadRequestException(
        'Group must be a paid group the learner is currently enrolled in'
      );
    }
  }

  private getLearnerPaymentsScope(actor: User): Prisma.LearnerPaymentWhereInput {
    if (actor.role === UserRole.ADMIN || actor.role === UserRole.MODERATOR) {
      return {};
    }

    if (actor.role === UserRole.TUTOR) {
      return {
        learner: {
          studentGroups: {
            some: {
              group: {
                tutorId: actor.id,
              },
            },
          },
        },
      };
    }

    return {
      learnerId: actor.id,
    };
  }

  private getLearnerPaymentsOrderBy(
    sortBy?: LearnerPaymentsSortBy,
    sortOrder: SortOrder = 'desc'
  ): Prisma.LearnerPaymentOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'learnerName':
        return [{ learner: { name: sortOrder } }, { createdAt: 'desc' }];
      case 'groupName':
        return [{ group: { name: sortOrder } }, { createdAt: 'desc' }];
      case 'totalAmount':
        return [{ totalAmount: sortOrder }, { createdAt: 'desc' }];
      case 'currency':
        return [{ currency: sortOrder }, { createdAt: 'desc' }];
      case 'status':
        return [{ status: sortOrder }, { createdAt: 'desc' }];
      case 'periodFrom':
        return [{ periodFrom: sortOrder }, { createdAt: 'desc' }];
      case 'periodTo':
        return [{ periodTo: sortOrder }, { createdAt: 'desc' }];
      case 'createdAt':
        return [{ createdAt: sortOrder }];
      default:
        return [{ periodFrom: 'desc' }, { createdAt: 'desc' }];
    }
  }

  private toLearnerPaymentSummaryDto(row: {
    id: string;
    learnerId: string;
    groupId: string;
    periodFrom: Date;
    periodTo: Date;
    totalAmount: Prisma.Decimal;
    currency: CurrencyCode;
    status: DbPaymentStatus;
    createdAt: Date;
    updatedAt: Date;
    learner: { id: string; name: string };
    group: { id: string; name: string };
    transactions: {
      id: string;
      type: DbTransactionType;
      entityType: DbTransactionEntityType;
      amount: Prisma.Decimal;
      currency: CurrencyCode;
      createdById: string;
      learnerPaymentId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }): LearnerPaymentSummaryDto {
    return {
      id: row.id,
      learnerId: row.learnerId,
      learnerName: row.learner.name,
      groupId: row.groupId,
      groupName: row.group.name,
      periodFrom: row.periodFrom.toISOString() as ISODateString,
      periodTo: row.periodTo.toISOString() as ISODateString,
      totalAmount: Number(row.totalAmount),
      currency: row.currency,
      status: row.status,
      createdAt: row.createdAt.toISOString() as ISODateString,
      updatedAt: row.updatedAt.toISOString() as ISODateString,
      transactions: row.transactions.map((transaction) => ({
        id: transaction.id,
        type: transaction.type,
        entityType: transaction.entityType,
        amount: Number(transaction.amount),
        currency: transaction.currency,
        createdById: transaction.createdById,
        learnerPaymentId: transaction.learnerPaymentId ?? undefined,
        createdAt: transaction.createdAt.toISOString() as ISODateString,
        updatedAt: transaction.updatedAt.toISOString() as ISODateString,
      })),
    };
  }
}
