/**
 * Payment seed — simplified scenarios:
 *
 *  S1  PAID learner payment  — full amount, 1 INCOME transaction, linked to a group
 *  S2  PAID learner payment  — second period for the same learner
 *  S3  Manual EXPENSE transaction — stand-in for a tutor payout, no dedicated entity
 */

import { CurrencyCode, PrismaClient } from 'generated/prisma/client';
import { SeededGroupWithStudents } from './group.seed';

/** Returns start-of-day UTC Date for a YYYY-MM-DD string. */
function utcDayStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/** Returns end-of-day UTC Date for a YYYY-MM-DD string. */
function utcDayEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999Z`);
}

export async function seedPayments(args: {
  prisma: PrismaClient;
  groups: SeededGroupWithStudents[];
  createdById: string;
}): Promise<void> {
  const { prisma, groups, createdById } = args;

  if (groups.length < 1) {
    console.warn('seedPayments: need at least 1 group — skipping payment seed');
    return;
  }

  const primaryGroup = groups[0];

  if (primaryGroup.studentIds.length < 2) {
    console.warn('seedPayments: primary group has fewer than 2 students — skipping payment seed');
    return;
  }

  const [learnerA, learnerB] = primaryGroup.studentIds;

  // Fixed periods for deterministic seeds
  const periodA = { from: '2026-01-01', to: '2026-01-31' };
  const periodB = { from: '2026-02-01', to: '2026-02-28' };

  // ── S1: learnerA, period A ──────────────────────────────────────────────────
  const paymentA = await prisma.learnerPayment.create({
    data: {
      learnerId: learnerA,
      groupId: primaryGroup.id,
      periodFrom: utcDayStart(periodA.from),
      periodTo: utcDayEnd(periodA.to),
      totalAmount: primaryGroup.monthlyPrice,
      currency: primaryGroup.currency,
      status: 'PAID',
    },
  });

  await prisma.financialTransaction.create({
    data: {
      type: 'INCOME',
      amount: primaryGroup.monthlyPrice,
      currency: primaryGroup.currency,
      entityType: 'LEARNER_PAYMENT',
      learnerPaymentId: paymentA.id,
      createdById,
    },
  });

  // ── S2: learnerB, period B ──────────────────────────────────────────────────
  const paymentB = await prisma.learnerPayment.create({
    data: {
      learnerId: learnerB,
      groupId: primaryGroup.id,
      periodFrom: utcDayStart(periodB.from),
      periodTo: utcDayEnd(periodB.to),
      totalAmount: primaryGroup.monthlyPrice,
      currency: primaryGroup.currency,
      status: 'PAID',
    },
  });

  await prisma.financialTransaction.create({
    data: {
      type: 'INCOME',
      amount: primaryGroup.monthlyPrice,
      currency: primaryGroup.currency,
      entityType: 'LEARNER_PAYMENT',
      learnerPaymentId: paymentB.id,
      createdById,
    },
  });

  // ── S3: manual tutor payout (no dedicated entity, just an EXPENSE) ─────────
  await prisma.financialTransaction.create({
    data: {
      type: 'EXPENSE',
      amount: 300,
      currency: CurrencyCode.EGP,
      entityType: 'MANUAL',
      notes: 'مستحقات المعلم',
      createdById,
    },
  });

  console.log('Payment scenarios seeded: S1+S2(learner payments) S3(manual tutor payout)');
}
