import { combineDateTime, fromUTC, ISODateOnlyString } from '@halaqa/shared';
import { faker, fakerAR } from '@faker-js/faker';
import {
  AttendanceStatus,
  PrismaClient,
  SessionStatus,
} from 'generated/prisma/client';
import { SeededGroupWithStudents } from './group.seed';

export type SeededSessionScheduleDay = {
  dayOfWeek: number;
  startMinutes: number;
  durationMinutes: number;
};

/**
 * Build a schedule day in group timezone from a UTC instant.
 * Useful for deterministic test seeding around timezone boundaries.
 */
export function seededScheduleDayFromUtc(args: {
  utcIso: string;
  timezone: string;
  durationMinutes?: number;
}): SeededSessionScheduleDay {
  const localDateTime = fromUTC(args.utcIso, args.timezone);
  const dayOfWeek = localDateTime.weekday === 7 ? 0 : localDateTime.weekday;
  const startMinutes = localDateTime.hour * 60 + localDateTime.minute;

  return {
    dayOfWeek,
    startMinutes,
    durationMinutes: args.durationMinutes ?? 60,
  };
}

function getScheduledSessionStarts(args: {
  timezone: string;
  scheduleDays: { dayOfWeek: number; startMinutes: number }[];
  lookbackDays: number;
}): Date[] {
  const now = new Date();
  const slots = new Map<string, Date>();

  for (let offset = 1; offset <= args.lookbackDays; offset += 1) {
    const candidateUtc = new Date(now.getTime() - offset * 24 * 60 * 60 * 1000);
    const localDateTime = fromUTC(candidateUtc.toISOString(), args.timezone);
    const dayOfWeek = localDateTime.weekday === 7 ? 0 : localDateTime.weekday;
    const localDate = localDateTime.toFormat('yyyy-LL-dd') as ISODateOnlyString;

    for (const scheduleDay of args.scheduleDays) {
      if (scheduleDay.dayOfWeek !== dayOfWeek) {
        continue;
      }

      const startedAtIso = combineDateTime(
        localDate,
        scheduleDay.startMinutes as Parameters<typeof combineDateTime>[1],
        args.timezone,
      );
      const startedAt = new Date(startedAtIso);

      if (
        Number.isNaN(startedAt.getTime()) ||
        startedAt.getTime() >= now.getTime()
      ) {
        continue;
      }

      slots.set(startedAt.toISOString(), startedAt);
    }
  }

  return [...slots.values()].sort((a, b) => b.getTime() - a.getTime());
}

export async function seedSessionsAndAttendance(args: {
  prisma: PrismaClient;
  groups: SeededGroupWithStudents[];
  lookbackDays: number;
  sessionStatusWeights: SessionStatus[];
  attendanceStatusWeights: AttendanceStatus[];
}): Promise<void> {
  for (const group of args.groups) {
    const plannedSessions = getScheduledSessionStarts({
      timezone: group.timezone,
      scheduleDays: group.scheduleDays,
      lookbackDays: args.lookbackDays,
    });
    const selectedSessionStarts = faker.helpers
      .arrayElements(
        plannedSessions,
        Math.min(faker.number.int({ min: 4, max: 8 }), plannedSessions.length),
      )
      .sort((a, b) => a.getTime() - b.getTime());

    for (const startedAt of selectedSessionStarts) {
      const status = faker.helpers.arrayElement(args.sessionStatusWeights);
      const isRescheduled = status === 'RESCHEDULED';
      const session = await args.prisma.session.create({
        data: {
          groupId: group.id,
          startedAt,
          originalStartedAt: isRescheduled
            ? new Date(startedAt.getTime() - 24 * 60 * 60 * 1000)
            : null,
          status,
          notes: faker.datatype.boolean(0.3) ? fakerAR.lorem.sentence() : null,
        },
      });

      if (status !== 'COMPLETED' && status !== 'RESCHEDULED') {
        continue;
      }

      const attendanceRecords = group.studentIds.map((studentId) => {
        const attendanceStatus = faker.helpers.arrayElement(
          args.attendanceStatusWeights,
        );

        return {
          sessionId: session.id,
          userId: studentId,
          status: attendanceStatus,
          notes:
            attendanceStatus === 'ATTENDED' || faker.datatype.boolean(0.45)
              ? null
              : fakerAR.lorem.sentence(),
        };
      });

      if (attendanceRecords.length > 0) {
        await args.prisma.attendanceRecord.createMany({
          data: attendanceRecords,
          skipDuplicates: true,
        });
      }
    }
  }
}
