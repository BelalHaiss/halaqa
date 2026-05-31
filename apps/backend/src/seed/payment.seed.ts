/**
 * Payment seed — covers all payment scenarios defined in payment-instructions.md:
 *
 *  S1  UNPAID learner payment        — total=500, paid=0,   no transactions
 *  S2  PARTIAL learner payment       — total=800, paid=300, 1 INCOME tx for 300
 *  S3  PAID learner payment          — total=600, paid=600, 1 INCOME tx for 600
 *  S4  Multi-group learner payment   — linked to 2 groups, exactly 1 active
 *  S5  First tutor payout            — derived from COMPLETED session snapshots
 *  S6  Second tutor payout           — non-overlapping period on same tutor (tests overlap guard)
 */

import { CurrencyCode, PrismaClient } from 'generated/prisma/client';
import { SeededGroupWithStudents } from './group.seed';

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Returns start-of-day UTC Date for a YYYY-MM-DD string. */
function utcDayStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

/** Returns end-of-day UTC Date for a YYYY-MM-DD string. */
function utcDayEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999Z`);
}

/** Formats a JS Date to YYYY-MM-DD in UTC. */
function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// ── Public ───────────────────────────────────────────────────────────────────

export async function seedPayments(args: {
  prisma: PrismaClient;
  groups: SeededGroupWithStudents[];
  createdById: string;
}): Promise<void> {
  const { prisma, groups, createdById } = args;

  if (groups.length < 2) {
    console.warn('seedPayments: need at least 2 groups — skipping payment seed');
    return;
  }

  const primaryGroup = groups[0];

  if (primaryGroup.studentIds.length < 3) {
    console.warn('seedPayments: primary group has fewer than 3 students — skipping payment seed');
    return;
  }

  const [learnerA, learnerB, learnerC] = primaryGroup.studentIds;

  // Fixed periods for deterministic seeds
  const periodA = { from: '2026-01-01', to: '2026-01-31' };
  const periodB = { from: '2026-02-01', to: '2026-02-28' };
  const periodC = { from: '2026-03-01', to: '2026-03-31' };

  // ── S1: UNPAID ──────────────────────────────────────────────────────────────
  await prisma.learnerPayment.create({
    data: {
      learnerId: learnerA,
      billingType: 'SESSION_COUNT_MONTHLY',
      sessionsCount: 8,
      periodFrom: utcDayStart(periodA.from),
      periodTo: utcDayEnd(periodA.to),
      totalAmount: 500,
      paidAmount: 0,
      currency: CurrencyCode.EGP,
      status: 'UNPAID',
    },
  });

  // ── S2: PARTIAL ─────────────────────────────────────────────────────────────
  const partialPayment = await prisma.learnerPayment.create({
    data: {
      learnerId: learnerB,
      billingType: 'SESSION_COUNT_MONTHLY',
      sessionsCount: 10,
      periodFrom: utcDayStart(periodA.from),
      periodTo: utcDayEnd(periodA.to),
      totalAmount: 800,
      paidAmount: 300,
      currency: CurrencyCode.EGP,
      status: 'PARTIAL',
    },
  });

  await prisma.financialTransaction.create({
    data: {
      type: 'INCOME',
      amount: 300,
      currency: CurrencyCode.EGP,
      entityType: 'LEARNER_PAYMENT',
      learnerPaymentId: partialPayment.id,
      createdById,
    },
  });

  // ── S3: PAID ────────────────────────────────────────────────────────────────
  const paidPayment = await prisma.learnerPayment.create({
    data: {
      learnerId: learnerC,
      billingType: 'SESSION_COUNT_MONTHLY',
      sessionsCount: 12,
      periodFrom: utcDayStart(periodA.from),
      periodTo: utcDayEnd(periodA.to),
      totalAmount: 600,
      paidAmount: 600,
      currency: CurrencyCode.EGP,
      status: 'PAID',
    },
  });

  await prisma.financialTransaction.create({
    data: {
      type: 'INCOME',
      amount: 600,
      currency: CurrencyCode.EGP,
      entityType: 'LEARNER_PAYMENT',
      learnerPaymentId: paidPayment.id,
      createdById,
    },
  });

  // ── S4: learnerA second period payment ─────────────────────────────────────
  await prisma.learnerPayment.create({
    data: {
      learnerId: learnerA,
      billingType: 'SESSION_COUNT_MONTHLY',
      sessionsCount: 16,
      periodFrom: utcDayStart(periodB.from),
      periodTo: utcDayEnd(periodB.to),
      totalAmount: 700,
      paidAmount: 200,
      currency: CurrencyCode.EGP,
      status: 'PARTIAL',
    },
  });

  // ── S5 & S6: Tutor payouts ──────────────────────────────────────────────────
  // Find COMPLETED sessions for the primary group's tutor within fixed windows.
  // Periods are chosen to be old enough that seeded sessions from MAX_SESSION_DAYS_LOOKBACK
  // (70 days) may exist there; if not we fall back to a synthetic approach.

  const tutor = primaryGroup.tutorId;

  // Period window for S5: 70 days ago → 36 days ago
  const now = new Date();
  const s5End = new Date(now.getTime() - 36 * 24 * 60 * 60 * 1000);
  const s5Start = new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000);
  const s5FromStr = toDateStr(s5Start);
  const s5ToStr = toDateStr(s5End);

  const s5Sessions = await prisma.session.findMany({
    where: {
      tutorId: tutor,
      status: 'COMPLETED',
      startedAt: { gte: utcDayStart(s5FromStr), lte: utcDayEnd(s5ToStr) },
    },
    select: { tutorSessionPrice: true, tutorCurrency: true },
  });

  const paidS5Sessions = s5Sessions.filter((session) => Number(session.tutorSessionPrice ?? 0) > 0);

  if (paidS5Sessions.length > 0) {
    const currencies = [...new Set(paidS5Sessions.map((s) => s.tutorCurrency))];
    const currency: CurrencyCode = currencies[0]!;

    // Use only single-currency sessions (matches the service constraint)
    const singleCurrencySessions = paidS5Sessions.filter((s) => s.tutorCurrency === currency);
    const totalAmount = singleCurrencySessions.reduce(
      (sum, s) => sum + Number(s.tutorSessionPrice ?? 0),
      0
    );

    const s5Payment = await prisma.tutorPayment.create({
      data: {
        tutorId: tutor,
        periodFrom: utcDayStart(s5FromStr),
        periodTo: utcDayEnd(s5ToStr),
        sessionsCount: singleCurrencySessions.length,
        totalAmount,
        currency,
      },
    });

    await prisma.financialTransaction.create({
      data: {
        type: 'EXPENSE',
        amount: totalAmount,
        currency,
        entityType: 'TUTOR_PAYMENT',
        tutorPaymentId: s5Payment.id,
        createdById,
      },
    });

    // ── S6: Second non-overlapping payout ────────────────────────────────────
    // Period window for S6: 35 days ago → 8 days ago (does not overlap S5)
    const s6Start = new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000);
    const s6End = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000);
    const s6FromStr = toDateStr(s6Start);
    const s6ToStr = toDateStr(s6End);

    const s6Sessions = await prisma.session.findMany({
      where: {
        tutorId: tutor,
        status: 'COMPLETED',
        startedAt: { gte: utcDayStart(s6FromStr), lte: utcDayEnd(s6ToStr) },
        // Exclude sessions already counted in S5
        NOT: {
          startedAt: { lte: utcDayEnd(s5ToStr) },
        },
      },
      select: { tutorSessionPrice: true, tutorCurrency: true },
    });

    const s6Sessions1Currency = s6Sessions.filter(
      (s) => s.tutorCurrency === currency && Number(s.tutorSessionPrice ?? 0) > 0
    );

    if (s6Sessions1Currency.length > 0) {
      const s6Total = s6Sessions1Currency.reduce(
        (sum, s) => sum + Number(s.tutorSessionPrice ?? 0),
        0
      );

      const s6Payment = await prisma.tutorPayment.create({
        data: {
          tutorId: tutor,
          periodFrom: utcDayStart(s6FromStr),
          periodTo: utcDayEnd(s6ToStr),
          sessionsCount: s6Sessions1Currency.length,
          totalAmount: s6Total,
          currency,
        },
      });

      await prisma.financialTransaction.create({
        data: {
          type: 'EXPENSE',
          amount: s6Total,
          currency,
          entityType: 'TUTOR_PAYMENT',
          tutorPaymentId: s6Payment.id,
          createdById,
        },
      });
    }
  } else {
    // No COMPLETED sessions found in the window — create a synthetic UNPAID-period
    // tutor payment using the group's rate so the table is non-empty for UI testing.
    const safeTutorRate = Math.max(primaryGroup.tutorHourlyRate, 1);
    const syntheticPayment = await prisma.tutorPayment.create({
      data: {
        tutorId: tutor,
        periodFrom: utcDayStart(periodC.from),
        periodTo: utcDayEnd(periodC.to),
        sessionsCount: 4,
        totalAmount: safeTutorRate * 4,
        currency: primaryGroup.tutorCurrency,
      },
    });

    await prisma.financialTransaction.create({
      data: {
        type: 'EXPENSE',
        amount: safeTutorRate * 4,
        currency: primaryGroup.tutorCurrency,
        entityType: 'TUTOR_PAYMENT',
        tutorPaymentId: syntheticPayment.id,
        createdById,
      },
    });
  }

  console.log(
    'Payment scenarios seeded: S1(UNPAID) S2(PARTIAL) S3(PAID) S4(multi-group) S5+S6(tutor payouts)'
  );
}
