import { getNowAsUTC, fromUTC } from '@halaqa/shared';
import type {
  ISODateOnlyString,
  SessionComputedStatus,
  SessionDetailsDTO,
  SessionSummaryDTO,
  TimeHHMMString,
  UpdateSessionActionDTO,
} from '@halaqa/shared';
import type { Prisma, User } from 'generated/prisma/client';
import { SessionStatus, UserRole } from 'generated/prisma/client';

const VIRTUAL_SESSION_PREFIX = 'virtual';
const MISSED_THRESHOLD_HOURS = 12;
const RECENTLY_MISSED_WINDOW_HOURS = 12;

type ScheduleDayLike = {
  dayOfWeek: number;
  startMinutes: number;
};

type SessionRecordLike = {
  id: string;
  startedAt: Date;
  status: SessionStatus;
};

type GroupScheduleLike = {
  timezone: string;
  scheduleDays: ScheduleDayLike[];
};

type SessionDetailsRecordLike = {
  id: string;
  startedAt: Date;
  originalStartedAt: Date | null;
  status: SessionStatus;
  group: {
    id: string;
    name: string;
    tutor: {
      id: string;
      name: string;
    };
    students: {
      user: {
        id: string;
        name: string;
      };
    }[];
  };
  attendance: {
    user: {
      id: string;
      name: string;
    };
    status: SessionDetailsDTO['attendance'][number]['status'];
    notes: string | null;
  }[];
};

type VirtualSessionGroupLike = {
  id: string;
  name: string;
  tutor: {
    id: string;
    name: string;
  };
  students: {
    user: {
      id: string;
      name: string;
    };
  }[];
};

export function buildVirtualSessionId(
  groupId: string,
  startedAt: Date,
): string {
  const payload = `${groupId}|${startedAt.toISOString()}`;
  return `${VIRTUAL_SESSION_PREFIX}:${Buffer.from(payload).toString('base64url')}`;
}

// Virtual IDs allow us to represent planned sessions that do not have a DB row yet.
export function parseVirtualSessionId(id: string) {
  if (!id.startsWith(`${VIRTUAL_SESSION_PREFIX}:`)) {
    return null;
  }

  const encodedPayload = id.slice(VIRTUAL_SESSION_PREFIX.length + 1);
  const decodedPayload = Buffer.from(encodedPayload, 'base64url').toString(
    'utf-8',
  );
  const [groupId, startedAtRaw] = decodedPayload.split('|');
  const startedAt = new Date(startedAtRaw);

  if (!groupId || Number.isNaN(startedAt.getTime())) {
    return null;
  }

  return { groupId, startedAt };
}

export function resolveSessionStatus(args: {
  startedAt: Date;
  sessionRecord?: SessionRecordLike | null;
  nowUtcIso?: string;
}): SessionComputedStatus {
  if (args.sessionRecord) {
    return args.sessionRecord.status;
  }

  const nowUtc = fromUTC(args.nowUtcIso ?? getNowAsUTC(), 'UTC');
  const startedAtUtc = fromUTC(args.startedAt.toISOString(), 'UTC');
  const missedAfter = startedAtUtc.plus({ hours: MISSED_THRESHOLD_HOURS });

  return nowUtc.toMillis() >= missedAfter.toMillis() ? 'MISSED' : 'SCHEDULED';
}

export function canSessionBeRescheduled(args: {
  sessionRecord?: SessionRecordLike | null;
  nowUtcIso?: string;
}): boolean {
  if (!args.sessionRecord) {
    return true;
  }

  if (args.sessionRecord.status !== SessionStatus.MISSED) {
    return false;
  }

  const nowUtc = fromUTC(args.nowUtcIso ?? getNowAsUTC(), 'UTC');
  const startedAtUtc = fromUTC(
    args.sessionRecord.startedAt.toISOString(),
    'UTC',
  );
  const diffMillis = nowUtc.toMillis() - startedAtUtc.toMillis();

  return (
    diffMillis >= 0 &&
    diffMillis <= RECENTLY_MISSED_WINDOW_HOURS * 60 * 60 * 1000
  );
}

export function formatSessionDateAndTime(startedAt: Date, timezone: string) {
  const dateTime = fromUTC(startedAt.toISOString(), timezone);

  return {
    date: dateTime.toFormat('yyyy-LL-dd') as ISODateOnlyString,
    time: dateTime.toFormat('HH:mm') as TimeHHMMString,
  };
}

export function mapSessionSummary(args: {
  groupId: string;
  groupName: string;
  tutorName: string;
  startedAt: Date;
  userTimezone: string;
  sessionRecord?: SessionRecordLike | null;
  nowUtcIso?: string;
}): SessionSummaryDTO {
  const { date, time } = formatSessionDateAndTime(
    args.startedAt,
    args.userTimezone,
  );

  return {
    id:
      args.sessionRecord?.id ??
      buildVirtualSessionId(args.groupId, args.startedAt),
    groupName: args.groupName,
    tutorName: args.tutorName,
    date,
    time,
    sessionStatus: resolveSessionStatus({
      startedAt: args.startedAt,
      sessionRecord: args.sessionRecord,
      nowUtcIso: args.nowUtcIso,
    }),
  };
}

export function mapSessionDetails(args: {
  sessionRecord: SessionDetailsRecordLike;
  userTimezone: string;
  nowUtcIso?: string;
}): SessionDetailsDTO {
  const { date, time } = formatSessionDateAndTime(
    args.sessionRecord.startedAt,
    args.userTimezone,
  );

  return {
    id: args.sessionRecord.id,
    groupInfo: {
      id: args.sessionRecord.group.id,
      name: args.sessionRecord.group.name,
    },
    tutorInfo: {
      id: args.sessionRecord.group.tutor.id,
      name: args.sessionRecord.group.tutor.name,
    },
    status: resolveSessionStatus({
      startedAt: args.sessionRecord.startedAt,
      sessionRecord: args.sessionRecord,
      nowUtcIso: args.nowUtcIso,
    }),
    canBeRescheduled: canSessionBeRescheduled({
      sessionRecord: args.sessionRecord,
      nowUtcIso: args.nowUtcIso,
    }),
    date,
    time,
    originalStartedAt: args.sessionRecord.originalStartedAt
      ? (args.sessionRecord.originalStartedAt.toISOString() as SessionDetailsDTO['originalStartedAt'])
      : null,
    students: args.sessionRecord.group.students.map((item) => ({
      id: item.user.id,
      name: item.user.name,
    })),
    attendance: args.sessionRecord.attendance.map((attendanceRecord) => ({
      studentId: attendanceRecord.user.id,
      studentName: attendanceRecord.user.name,
      status: attendanceRecord.status,
      notes: attendanceRecord.notes ?? undefined,
    })),
  };
}

export function mapVirtualSessionDetails(args: {
  sessionId: string;
  group: VirtualSessionGroupLike;
  startedAt: Date;
  userTimezone: string;
  nowUtcIso?: string;
}): SessionDetailsDTO {
  const { date, time } = formatSessionDateAndTime(
    args.startedAt,
    args.userTimezone,
  );

  return {
    id: args.sessionId,
    groupInfo: {
      id: args.group.id,
      name: args.group.name,
    },
    tutorInfo: {
      id: args.group.tutor.id,
      name: args.group.tutor.name,
    },
    status: resolveSessionStatus({
      startedAt: args.startedAt,
      nowUtcIso: args.nowUtcIso,
    }),
    canBeRescheduled: true,
    date,
    time,
    originalStartedAt: null,
    students: args.group.students.map((item) => ({
      id: item.user.id,
      name: item.user.name,
    })),
    attendance: [],
  };
}

export function buildPlannedStartedAtForDay(
  dayStartUtcIso: string,
  groupTimezone: string,
  startMinutes: number,
): Date {
  return fromUTC(dayStartUtcIso, groupTimezone)
    .startOf('day')
    .plus({ minutes: startMinutes })
    .toUTC()
    .toJSDate();
}

// Grouping once avoids repeated O(n) scans when mapping sessions by group.
export function groupSessionRecordsByGroup<T extends { groupId: string }>(
  sessionRecords: T[],
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();

  for (const sessionRecord of sessionRecords) {
    const records = grouped.get(sessionRecord.groupId);
    if (records) {
      records.push(sessionRecord);
    } else {
      grouped.set(sessionRecord.groupId, [sessionRecord]);
    }
  }

  return grouped;
}

export function findSessionRecordForOccurrence<
  T extends { startedAt: Date; originalStartedAt?: Date | null },
>(sessionRecords: T[], occurrenceStartedAt: Date): T | undefined {
  const occurrenceMillis = occurrenceStartedAt.getTime();

  return (
    sessionRecords.find(
      (record) => record.originalStartedAt?.getTime() === occurrenceMillis,
    ) ??
    sessionRecords.find(
      (record) => record.startedAt.getTime() === occurrenceMillis,
    )
  );
}

export function getOccurrenceKey(groupId: string, startedAt: Date): string {
  return `${groupId}|${startedAt.toISOString()}`;
}

export function collectOccurrenceKeys(
  sessionRecords: {
    groupId: string;
    startedAt: Date;
    originalStartedAt?: Date | null;
  }[],
): Set<string> {
  const keys = new Set<string>();

  for (const sessionRecord of sessionRecords) {
    keys.add(getOccurrenceKey(sessionRecord.groupId, sessionRecord.startedAt));

    if (sessionRecord.originalStartedAt) {
      keys.add(
        getOccurrenceKey(
          sessionRecord.groupId,
          sessionRecord.originalStartedAt,
        ),
      );
    }
  }

  return keys;
}

export function filterMissingOccurrences<
  T extends { groupId: string; startedAt: Date },
>(plannedOccurrences: T[], existingKeys: Set<string>): T[] {
  return plannedOccurrences.filter(
    (occurrence) =>
      !existingKeys.has(
        getOccurrenceKey(occurrence.groupId, occurrence.startedAt),
      ),
  );
}

export function buildGroupScopeWhere(
  user: Pick<User, 'id' | 'role'>,
  dayOfWeek: number,
): Prisma.GroupWhereInput {
  const where: Prisma.GroupWhereInput = {
    status: 'ACTIVE',
    scheduleDays: {
      some: {
        dayOfWeek: {
          equals: dayOfWeek,
        },
      },
    },
  };

  if (user.role === UserRole.TUTOR) {
    where.tutorId = user.id;
  }

  return where;
}

export function occurrenceMatchesGroupSchedule(
  occurrenceStartedAt: Date,
  groupTimezone: string,
  scheduleDays: ScheduleDayLike[],
): boolean {
  const occurrenceInGroupTimezone = fromUTC(
    occurrenceStartedAt.toISOString(),
    groupTimezone,
  );
  const occurrenceDayOfWeek =
    occurrenceInGroupTimezone.weekday === 7
      ? 0
      : occurrenceInGroupTimezone.weekday;
  const occurrenceStartMinutes =
    occurrenceInGroupTimezone.hour * 60 + occurrenceInGroupTimezone.minute;

  return scheduleDays.some(
    (scheduleDay) =>
      scheduleDay.dayOfWeek === occurrenceDayOfWeek &&
      scheduleDay.startMinutes === occurrenceStartMinutes,
  );
}

export function findInvalidAttendanceStudentId(
  attendance: UpdateSessionActionDTO['attendance'],
  groupStudentIds: Set<string>,
): string | null {
  for (const attendanceRecord of attendance ?? []) {
    if (!groupStudentIds.has(attendanceRecord.studentId)) {
      return attendanceRecord.studentId;
    }
  }

  return null;
}

export function shouldSetOriginalStartedAtForAttendance(args: {
  nowUtcMillis: number;
  startedAt: Date;
  originalStartedAt?: Date | null;
}): boolean {
  return (
    args.nowUtcMillis < args.startedAt.getTime() && !args.originalStartedAt
  );
}

export function generatePlannedOccurrencesForRange(
  group: GroupScheduleLike,
  rangeStartUtcIso: string,
  rangeEndUtcIso: string,
): Date[] {
  const rangeStartUtc = fromUTC(rangeStartUtcIso, 'UTC');
  const rangeEndUtc = fromUTC(rangeEndUtcIso, 'UTC');
  const localStart = fromUTC(rangeStartUtcIso, group.timezone)
    .startOf('day')
    .minus({ days: 1 });
  const localEnd = fromUTC(rangeEndUtcIso, group.timezone)
    .startOf('day')
    .plus({ days: 1 });

  const planned: Date[] = [];

  for (
    let cursor = localStart;
    cursor.toMillis() <= localEnd.toMillis();
    cursor = cursor.plus({ days: 1 })
  ) {
    const dayOfWeek = cursor.weekday === 7 ? 0 : cursor.weekday;
    const scheduleDay = group.scheduleDays.find(
      (item) => item.dayOfWeek === dayOfWeek,
    );

    if (!scheduleDay) {
      continue;
    }

    const startedAtUtc = cursor
      .startOf('day')
      .plus({ minutes: scheduleDay.startMinutes })
      .toUTC();

    if (
      startedAtUtc.toMillis() >= rangeStartUtc.toMillis() &&
      startedAtUtc.toMillis() <= rangeEndUtc.toMillis()
    ) {
      planned.push(startedAtUtc.toJSDate());
    }
  }

  return planned;
}
