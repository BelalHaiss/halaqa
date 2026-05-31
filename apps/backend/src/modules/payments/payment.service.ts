import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ApplyLearnerPaymentDto,
  CreateLearnerPaymentDto,
  CreateTutorPaymentDto,
  DateRangeQueryType,
  ISODateOnlyString,
  ISODateString,
  LearnerBillingType,
  LearnerPaymentsSortBy,
  LearnerPaymentSummaryDto,
  PreviewTutorPaymentDto,
  QueryLearnerPaymentsDto,
  QueryLearnerPaymentsResponseDto,
  QueryTutorPaymentsDto,
  QueryTutorPaymentsResponseDto,
  SortOrder,
  TutorLatestAllowedDateDto,
  TutorPaymentBreakdown,
  TutorPaymentPreviewDto,
  TutorPaymentsSortBy,
  TutorPaymentSummaryDto,
  formatDate,
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
  assertCurrencyMatch,
  assertDateRange,
  assertPaymentAmount,
  buildTutorOverlapWhere,
  deriveLearnerPaymentStatus,
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

    const initialPaidAmount = dto.initialPaidAmount ?? 0;
    assertPaymentAmount(dto.totalAmount, initialPaidAmount);

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

      const createdLearnerPayment = await tx.learnerPayment.create({
        data: {
          learnerId: dto.learnerId,
          billingType: dto.billingType,
          sessionsCount: dto.sessionsCount,
          periodFrom,
          periodTo,
          totalAmount: dto.totalAmount,
          paidAmount: initialPaidAmount,
          currency: dto.currency,
          status: deriveLearnerPaymentStatus(dto.totalAmount, initialPaidAmount),
        },
      });

      if (initialPaidAmount > 0) {
        await tx.financialTransaction.create({
          data: {
            type: 'INCOME',
            amount: initialPaidAmount,
            currency: dto.currency,
            entityType: 'LEARNER_PAYMENT',
            learnerPaymentId: createdLearnerPayment.id,
            createdById: actor.id,
          },
        });
      }

      return createdLearnerPayment.id;
    });

    return this.getLearnerPaymentDetails(actor, created);
  }

  async applyLearnerPayment(
    actor: User,
    learnerPaymentId: string,
    dto: ApplyLearnerPaymentDto
  ): Promise<LearnerPaymentSummaryDto> {
    assertActorCanManagePayments(actor.role);

    await this.prismaService.$transaction(async (tx) => {
      const learnerPayment = await tx.learnerPayment.findUnique({
        where: { id: learnerPaymentId },
      });

      if (!learnerPayment) {
        throw new NotFoundException('Learner payment not found');
      }

      assertCurrencyMatch(learnerPayment.currency, dto.currency);

      const nextPaidAmount = learnerPayment.paidAmount
        .add(new Prisma.Decimal(dto.amount))
        .toNumber();
      assertPaymentAmount(Number(learnerPayment.totalAmount), nextPaidAmount);

      await tx.financialTransaction.create({
        data: {
          type: 'INCOME',
          amount: dto.amount,
          currency: dto.currency,
          entityType: 'LEARNER_PAYMENT',
          learnerPaymentId,
          createdById: actor.id,
        },
      });

      await tx.learnerPayment.update({
        where: { id: learnerPaymentId },
        data: {
          paidAmount: nextPaidAmount,
          status: deriveLearnerPaymentStatus(Number(learnerPayment.totalAmount), nextPaidAmount),
        },
      });
    });

    return this.getLearnerPaymentDetails(actor, learnerPaymentId);
  }

  async deleteLearnerPayment(actor: User, id: string): Promise<void> {
    assertActorCanDeletePayments(actor.role);

    await this.prismaService.learnerPayment.delete({
      where: { id },
    });
  }

  async queryTutorPayments(
    actor: User,
    query: QueryTutorPaymentsDto
  ): Promise<QueryTutorPaymentsResponseDto> {
    const { skip, take, page } = this.prismaService.handleQueryPagination(query);
    const periodFromFilter = this.prismaService.handleDateRangeFilter(
      query as DateRangeQueryType,
      actor.timezone
    );

    const where: Prisma.TutorPaymentWhereInput = {
      ...this.getTutorPaymentsScope(actor),
      ...(query.tutorId ? { tutorId: query.tutorId } : {}),
      ...(query.currency ? { currency: query.currency } : {}),
      ...(periodFromFilter ? { periodFrom: periodFromFilter } : {}),
    };

    const orderBy = this.getTutorPaymentsOrderBy(query.sortBy, query.sortOrder);

    const [rows, count] = await this.prismaService.$transaction([
      this.prismaService.tutorPayment.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          tutor: {
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
      this.prismaService.tutorPayment.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toTutorPaymentSummaryDto(row)),
      ...this.prismaService.formatPaginationResponse({
        page,
        count,
        limit: take,
      }),
    };
  }

  async getTutorPaymentDetails(actor: User, id: string): Promise<TutorPaymentSummaryDto> {
    if (actor.role === UserRole.STUDENT) {
      throw new ForbiddenException('Learners cannot access tutor payouts');
    }

    const row = await this.prismaService.tutorPayment.findFirst({
      where: {
        id,
        ...this.getTutorPaymentsScope(actor),
      },
      include: {
        tutor: {
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
      throw new NotFoundException('Tutor payout not found');
    }

    return this.toTutorPaymentSummaryDto(row);
  }

  async getTutorLatestAllowedDate(
    actor: User,
    tutorId: string
  ): Promise<TutorLatestAllowedDateDto> {
    this.assertTutorScope(actor, tutorId);

    const latest = await this.prismaService.tutorPayment.findFirst({
      where: { tutorId },
      orderBy: {
        periodTo: 'desc',
      },
      select: {
        periodTo: true,
      },
    });

    if (!latest) {
      return {
        tutorId,
      };
    }

    const latestPaidTo = formatDate({
      date: latest.periodTo.toISOString(),
      token: 'yyyy-LL-dd',
      timezone: 'UTC',
    }) as ISODateOnlyString;

    const nextAllowedDate = new Date(latest.periodTo.getTime() + 24 * 60 * 60 * 1000);
    const nextAllowedFrom = formatDate({
      date: nextAllowedDate.toISOString(),
      token: 'yyyy-LL-dd',
      timezone: 'UTC',
    }) as ISODateOnlyString;

    return {
      tutorId,
      latestPaidTo,
      nextAllowedFrom,
    };
  }

  async previewTutorPayment(
    actor: User,
    dto: PreviewTutorPaymentDto
  ): Promise<TutorPaymentPreviewDto> {
    this.assertTutorScope(actor, dto.tutorId);

    return this.getTutorPaymentPreview(dto);
  }

  async createTutorPayment(
    actor: User,
    dto: CreateTutorPaymentDto
  ): Promise<TutorPaymentSummaryDto[]> {
    assertActorCanManagePayments(actor.role);

    const { startAsJSDate: periodFrom } = getStartAndEndOfDay('UTC', dto.periodFrom);
    const { endAsJSDate: periodTo } = getStartAndEndOfDay('UTC', dto.periodTo);

    const createdIds = await this.prismaService.$transaction(
      async (tx) => {
        const overlap = await tx.tutorPayment.findFirst({
          where: buildTutorOverlapWhere(dto.tutorId, periodFrom, periodTo),
          select: { id: true },
        });

        if (overlap) {
          throw new ConflictException('Selected payout period overlaps with an existing payout');
        }

        const sessions = await tx.session.findMany({
          where: {
            tutorId: dto.tutorId,
            status: 'COMPLETED',
            tutorSessionPrice: { not: null },
            tutorCurrency: { not: null },
            startedAt: {
              gte: periodFrom,
              lte: periodTo,
            },
          },
          select: {
            tutorSessionPrice: true,
            tutorCurrency: true,
          },
        });

        if (sessions.length === 0) {
          throw new BadRequestException('No completed sessions were found in the selected period');
        }

        const currencies = [...new Set(sessions.map((s) => s.tutorCurrency))].filter(
          (c): c is CurrencyCode => c !== null
        );

        const createdIds: string[] = [];
        for (const currency of currencies) {
          const currencySessions = sessions.filter((s) => s.tutorCurrency === currency);
          const totalAmount = currencySessions
            .reduce(
              (sum, s) => sum.add(s.tutorSessionPrice ?? new Prisma.Decimal(0)),
              new Prisma.Decimal(0)
            )
            .toNumber();

          const created = await tx.tutorPayment.create({
            data: {
              tutorId: dto.tutorId,
              periodFrom,
              periodTo,
              sessionsCount: currencySessions.length,
              totalAmount,
              currency,
            },
            select: { id: true },
          });

          await tx.financialTransaction.create({
            data: {
              type: 'EXPENSE',
              amount: totalAmount,
              currency,
              entityType: 'TUTOR_PAYMENT',
              tutorPaymentId: created.id,
              createdById: actor.id,
            },
          });

          createdIds.push(created.id);
        }

        return createdIds;
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return Promise.all(createdIds.map((id) => this.getTutorPaymentDetails(actor, id)));
  }

  async deleteTutorPayment(actor: User, id: string): Promise<void> {
    assertActorCanDeletePayments(actor.role);

    await this.prismaService.tutorPayment.delete({
      where: { id },
    });
  }

  private async getTutorPaymentPreview(
    dto: PreviewTutorPaymentDto
  ): Promise<TutorPaymentPreviewDto> {
    assertDateRange(dto.periodFrom, dto.periodTo);

    const { startAsJSDate: periodFrom } = getStartAndEndOfDay('UTC', dto.periodFrom);
    const { endAsJSDate: periodTo } = getStartAndEndOfDay('UTC', dto.periodTo);

    const sessions = await this.prismaService.session.findMany({
      where: {
        tutorId: dto.tutorId,
        status: 'COMPLETED',
        tutorSessionPrice: { not: null },
        tutorCurrency: { not: null },
        startedAt: {
          gte: periodFrom,
          lte: periodTo,
        },
      },
      select: {
        tutorSessionPrice: true,
        tutorCurrency: true,
      },
    });

    if (sessions.length === 0) {
      return {
        tutorId: dto.tutorId,
        periodFrom: dto.periodFrom,
        periodTo: dto.periodTo,
        breakdowns: [],
      };
    }

    const currencies = [...new Set(sessions.map((s) => s.tutorCurrency))].filter(
      (c): c is CurrencyCode => c !== null
    );

    const breakdowns: TutorPaymentBreakdown[] = currencies.map((currency) => {
      const currencySessions = sessions.filter((s) => s.tutorCurrency === currency);
      return {
        currency,
        sessionsCount: currencySessions.length,
        totalAmount: currencySessions
          .reduce(
            (sum, s) => sum.add(s.tutorSessionPrice ?? new Prisma.Decimal(0)),
            new Prisma.Decimal(0)
          )
          .toNumber(),
      };
    });

    return { tutorId: dto.tutorId, periodFrom: dto.periodFrom, periodTo: dto.periodTo, breakdowns };
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

  private getTutorPaymentsScope(actor: User): Prisma.TutorPaymentWhereInput {
    if (actor.role === UserRole.ADMIN || actor.role === UserRole.MODERATOR) {
      return {};
    }

    if (actor.role === UserRole.TUTOR) {
      return {
        tutorId: actor.id,
      };
    }

    throw new ForbiddenException('Learners cannot access tutor payouts');
  }

  private assertTutorScope(actor: User, tutorId: string): void {
    if (actor.role === UserRole.STUDENT) {
      throw new ForbiddenException('Learners cannot access tutor payouts');
    }

    if (actor.role === UserRole.TUTOR && actor.id !== tutorId) {
      throw new ForbiddenException('Tutors can only access their own payouts');
    }
  }

  private getLearnerPaymentsOrderBy(
    sortBy?: LearnerPaymentsSortBy,
    sortOrder: SortOrder = 'desc'
  ): Prisma.LearnerPaymentOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'learnerName':
        return [{ learner: { name: sortOrder } }, { createdAt: 'desc' }];
      case 'sessionsCount':
        return [{ sessionsCount: sortOrder }, { createdAt: 'desc' }];
      case 'totalAmount':
        return [{ totalAmount: sortOrder }, { createdAt: 'desc' }];
      case 'paidAmount':
        return [{ paidAmount: sortOrder }, { createdAt: 'desc' }];
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

  private getTutorPaymentsOrderBy(
    sortBy?: TutorPaymentsSortBy,
    sortOrder: SortOrder = 'desc'
  ): Prisma.TutorPaymentOrderByWithRelationInput[] {
    switch (sortBy) {
      case 'tutorName':
        return [{ tutor: { name: sortOrder } }, { createdAt: 'desc' }];
      case 'sessionsCount':
        return [{ sessionsCount: sortOrder }, { createdAt: 'desc' }];
      case 'totalAmount':
        return [{ totalAmount: sortOrder }, { createdAt: 'desc' }];
      case 'currency':
        return [{ currency: sortOrder }, { createdAt: 'desc' }];
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
    billingType: LearnerBillingType;
    sessionsCount: number;
    periodFrom: Date;
    periodTo: Date;
    totalAmount: Prisma.Decimal;
    paidAmount: Prisma.Decimal;
    currency: CurrencyCode;
    status: DbPaymentStatus;
    createdAt: Date;
    updatedAt: Date;
    learner: { id: string; name: string };
    transactions: {
      id: string;
      type: DbTransactionType;
      entityType: DbTransactionEntityType;
      amount: Prisma.Decimal;
      currency: CurrencyCode;
      createdById: string;
      learnerPaymentId: string | null;
      tutorPaymentId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }): LearnerPaymentSummaryDto {
    return {
      id: row.id,
      learnerId: row.learnerId,
      learnerName: row.learner.name,
      billingType: row.billingType,
      sessionsCount: row.sessionsCount,
      periodFrom: row.periodFrom.toISOString() as ISODateString,
      periodTo: row.periodTo.toISOString() as ISODateString,
      totalAmount: Number(row.totalAmount),
      paidAmount: Number(row.paidAmount),
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
        tutorPaymentId: transaction.tutorPaymentId ?? undefined,
        createdAt: transaction.createdAt.toISOString() as ISODateString,
        updatedAt: transaction.updatedAt.toISOString() as ISODateString,
      })),
    };
  }

  private toTutorPaymentSummaryDto(row: {
    id: string;
    tutorId: string;
    periodFrom: Date;
    periodTo: Date;
    sessionsCount: number;
    totalAmount: Prisma.Decimal;
    currency: CurrencyCode;
    createdAt: Date;
    updatedAt: Date;
    tutor: { id: string; name: string };
    transactions: {
      id: string;
      type: DbTransactionType;
      entityType: DbTransactionEntityType;
      amount: Prisma.Decimal;
      currency: CurrencyCode;
      createdById: string;
      learnerPaymentId: string | null;
      tutorPaymentId: string | null;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }): TutorPaymentSummaryDto {
    return {
      id: row.id,
      tutorId: row.tutorId,
      tutorName: row.tutor.name,
      periodFrom: row.periodFrom.toISOString() as ISODateString,
      periodTo: row.periodTo.toISOString() as ISODateString,
      sessionsCount: row.sessionsCount,
      totalAmount: Number(row.totalAmount),
      currency: row.currency,
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
        tutorPaymentId: transaction.tutorPaymentId ?? undefined,
        createdAt: transaction.createdAt.toISOString() as ISODateString,
        updatedAt: transaction.updatedAt.toISOString() as ISODateString,
      })),
    };
  }
}
