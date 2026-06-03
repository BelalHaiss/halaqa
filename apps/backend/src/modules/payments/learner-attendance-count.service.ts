import { Injectable, Logger } from '@nestjs/common';
import {
  AttendanceStatus,
  GroupBillingType,
  LearnerBillingType,
  Prisma,
} from 'generated/prisma/client';

export interface AttendanceEntry {
  userId: string;
  status: AttendanceStatus;
}

export interface SyncAttendedCountArgs {
  groupBillingType: GroupBillingType;
  attendanceRecords: AttendanceEntry[];
}

@Injectable()
export class LearnerAttendanceCountService {
  private readonly logger = new Logger(LearnerAttendanceCountService.name);

  /**
   * Called inside a Prisma transaction after attendance records are upserted.
   * For each non-EXCUSED attendee in a billable (non-FREE) group, looks up their
   * latest LearnerPayment and increments attendedCount if capacity remains.
   */
  async syncAttendedCount(
    tx: Prisma.TransactionClient,
    args: SyncAttendedCountArgs
  ): Promise<void> {
    // Bail early — FREE groups have no billing, nothing to track
    if (args.groupBillingType === GroupBillingType.FREE) {
      return;
    }

    // EXCUSED does not consume a session slot
    const billableAttendees = args.attendanceRecords.filter(
      (r) => r.status !== AttendanceStatus.EXCUSED
    );

    if (billableAttendees.length === 0) {
      return;
    }

    await Promise.all(billableAttendees.map((entry) => this.processAttendee(tx, entry.userId)));
  }

  private async processAttendee(tx: Prisma.TransactionClient, learnerId: string): Promise<void> {
    const payment = await tx.learnerPayment.findFirst({
      where: {
        learnerId,
        billingType: LearnerBillingType.SESSION_COUNT_MONTHLY,
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true, sessionsCount: true, attendedCount: true },
    });

    if (!payment) {
      // TODO: notify admin/moderator — learner has no active payment record
      this.logger.warn(
        `LearnerAttendanceCount: no payment found for learner ${learnerId}. Admin/moderator notification required.`
      );
      return;
    }

    if (payment.attendedCount >= payment.sessionsCount) {
      // TODO: notify admin/moderator — learner has exhausted their session count
      this.logger.warn(
        `LearnerAttendanceCount: learner ${learnerId} has exhausted session count (${payment.attendedCount}/${payment.sessionsCount}). Admin/moderator notification required.`
      );
      return;
    }

    await tx.learnerPayment.update({
      where: { id: payment.id },
      data: { attendedCount: { increment: 1 } },
    });
  }
}
