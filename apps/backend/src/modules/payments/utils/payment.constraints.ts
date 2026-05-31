import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PaymentStatus } from '@halaqa/shared';
import { Prisma, UserRole } from 'generated/prisma/client';

export const deriveLearnerPaymentStatus = (
  totalAmount: number,
  paidAmount: number
): PaymentStatus => {
  if (paidAmount <= 0) {
    return 'UNPAID';
  }

  if (paidAmount >= totalAmount) {
    return 'PAID';
  }

  return 'PARTIAL';
};

export const assertPaymentAmount = (totalAmount: number, paidAmount: number): void => {
  if (paidAmount < 0) {
    throw new BadRequestException('paidAmount cannot be negative');
  }

  if (paidAmount > totalAmount) {
    throw new BadRequestException('paidAmount cannot exceed totalAmount');
  }
};

export const assertCurrencyMatch = (expectedCurrency: string, actualCurrency: string): void => {
  if (expectedCurrency !== actualCurrency) {
    throw new ConflictException('Currency mismatch between payment and transaction');
  }
};

export const assertDateRange = (periodFrom: string, periodTo: string): void => {
  if (periodFrom > periodTo) {
    throw new BadRequestException('periodFrom must be before or equal to periodTo');
  }
};

export const buildTutorOverlapWhere = (
  tutorId: string,
  periodFrom: Date,
  periodTo: Date
): Prisma.TutorPaymentWhereInput => ({
  tutorId,
  periodFrom: {
    lte: periodTo,
  },
  periodTo: {
    gte: periodFrom,
  },
});

export const assertActorCanManagePayments = (role: UserRole): void => {
  if (role !== UserRole.ADMIN && role !== UserRole.MODERATOR) {
    throw new ForbiddenException('You are not allowed to manage payments');
  }
};

export const assertActorCanDeletePayments = (role: UserRole): void => {
  if (role !== UserRole.ADMIN) {
    throw new ForbiddenException('Only admins can delete payments');
  }
};
