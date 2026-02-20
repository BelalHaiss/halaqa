import { getNowAsUTC, fromUTC } from '@halaqa/shared';
import type {
  SessionComputedStatus,
  SessionDetailsDTO,
  SessionSummaryDTO,
  UpdateSessionActionDTO,
} from '@halaqa/shared';
import type { Prisma, User } from 'generated/prisma/client';
import { SessionStatus, UserRole } from 'generated/prisma/client';

// Virtual sessions represent planned occurrences without DB records
const VIRTUAL_SESSION_PREFIX = 'virtual';
// Sessions marked MISSED if not acted upon 12hrs after start
const MISSED_THRESHOLD_HOURS = 12;
// Missed sessions can be rescheduled within 12hrs window
const RECENTLY_MISSED_WINDOW_HOURS = 12;

/**
 * Branded type for virtual session identifiers.
 * Format: `virtual:${groupId}:${ISO8601_UTC_DateTime}`
 * Example: `virtual:abc123:2024-01-15T10:30:00.000Z`
 *
 * @remarks
 * - The datetime component is ALWAYS in UTC (ISO 8601 format with 'Z' suffix)
 * - Used to identify planned session occurrences that don't have DB records yet
 * - Can be parsed back using `parseVirtualSessionId()`
 */
export type VirtualSessionId = string & {
  readonly __brand: 'VirtualSessionId';
};

type ScheduleDayLike = {
  dayOfWeek: number;
  startMinutes: number;
};

type SessionRecordLike = {
  id: string;
  startedAt: Date;
  originalStartedAt?: Date | null;
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

/**
 * Create virtual session ID for planned occurrences without DB record.
 *
 * @param groupId - The ID of the group this session belongs to
 * @param startedAt - The session start time (will be converted to UTC ISO 8601)
 * @returns A branded virtual session ID in format `virtual:${groupId}:${ISO8601_UTC}`
 *
 * @remarks
 * - The returned datetime is ALWAYS in UTC format via `Date.toISOString()`
 * - Use `parseVirtualSessionId()` to extract groupId and startedAt back
 */
export function buildVirtualSessionId(
  groupId: string,
  startedAt: Date,
): VirtualSessionId {
  return `${VIRTUAL_SESSION_PREFIX}:${groupId}:${startedAt.toISOString()}` as VirtualSessionId;
}

/**
 * Parse virtual session ID back to its components.
 *
 * @param id - The virtual session ID to parse (or any string)
 * @returns Parsed groupId and startedAt (as UTC Date), or null if invalid
 *
 * @remarks
 * - Returns null if ID doesn't match expected format
 * - The returned `startedAt` is a Date object created from the UTC ISO string
 */
export function parseVirtualSessionId(id: string) {
  if (!id.startsWith(`${VIRTUAL_SESSION_PREFIX}:`)) {
    return null;
  }

  const parts = id.split(':');
  if (parts.length !== 3) {
    return null;
  }

  const groupId = parts[1];
  const startedAt = new Date(parts[2]);

  if (!groupId || Number.isNaN(startedAt.getTime())) {
    return null;
  }

  return { groupId, startedAt };
}

// ============================================================================
// Status Resolution
// ============================================================================

/** Determine session status based on record and time */
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

/** Check if missed session can still be rescheduled (within 12hr window) */
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

// ============================================================================
// ============================================================================
// Session Mapping (DTO Converters)
// ============================================================================

/** Map session to summary DTO for list views */
export function mapSessionSummary(args: {
  groupId: string;
  groupName: string;
  tutorName: string;
  startedAt: Date;
  sessionRecord?: SessionRecordLike | null;
  nowUtcIso?: string;
}): SessionSummaryDTO {
  return {
    id:
      args.sessionRecord?.id ??
      buildVirtualSessionId(args.groupId, args.startedAt),
    groupName: args.groupName,
    tutorName: args.tutorName,
    startedAt: args.startedAt.toISOString() as SessionSummaryDTO['startedAt'],
    originalStartedAt: args.sessionRecord?.originalStartedAt
      ? (args.sessionRecord.originalStartedAt.toISOString() as SessionSummaryDTO['originalStartedAt'])
      : null,
    sessionStatus: resolveSessionStatus({
      startedAt: args.startedAt,
      sessionRecord: args.sessionRecord,
      nowUtcIso: args.nowUtcIso,
    }),
  };
}

/** Map session record to detailed DTO */
export function mapSessionDetails(args: {
  sessionRecord: SessionDetailsRecordLike;
  nowUtcIso?: string;
}): SessionDetailsDTO {
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
    startedAt:
      args.sessionRecord.startedAt.toISOString() as SessionDetailsDTO['startedAt'],
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

/** Map virtual (planned) session to detailed DTO */
export function mapVirtualSessionDetails(args: {
  sessionId: string;
  group: VirtualSessionGroupLike;
  startedAt: Date;
  nowUtcIso?: string;
}): SessionDetailsDTO {
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
    startedAt: args.startedAt.toISOString() as SessionDetailsDTO['startedAt'],
    originalStartedAt: null,
    students: args.group.students.map((item) => ({
      id: item.user.id,
      name: item.user.name,
    })),
    attendance: [],
  };
}

// ============================================================================
// Planned Occurrence Helpers
// ============================================================================

/** Build planned session start time for a specific day */
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

/** Group session records by groupId for efficient lookups */
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

// ============================================================================
// Occurrence Tracking (for Missed Session Detection)
// ============================================================================

/** Collect all occurrence keys from session records */
export function collectOccurrenceKeys(
  sessionRecords: {
    groupId: string;
    startedAt: Date;
    originalStartedAt?: Date | null;
  }[],
): Set<string> {
  const keys = new Set<string>();

  for (const sessionRecord of sessionRecords) {
    const key = `${sessionRecord.groupId}|${sessionRecord.startedAt.toISOString()}`;
    keys.add(key);

    if (sessionRecord.originalStartedAt) {
      const originalKey = `${sessionRecord.groupId}|${sessionRecord.originalStartedAt.toISOString()}`;
      keys.add(originalKey);
    }
  }

  return keys;
}

/** Filter out occurrences that already have session records */
export function filterMissingOccurrences<
  T extends { groupId: string; startedAt: Date },
>(plannedOccurrences: T[], existingKeys: Set<string>): T[] {
  return plannedOccurrences.filter((occurrence) => {
    const key = `${occurrence.groupId}|${occurrence.startedAt.toISOString()}`;
    return !existingKeys.has(key);
  });
}

// ============================================================================
// Query Builders
// ============================================================================

/** Build Prisma where clause for group scope based on user role and day */
export function buildGroupScopeWhere(
  user: Pick<User, 'id' | 'role'>,
): Prisma.GroupWhereInput {
  const where: Prisma.GroupWhereInput = {
    status: 'ACTIVE',
  };

  if (user.role === UserRole.TUTOR) {
    where.tutorId = user.id;
  }

  return where;
}

/**
 * Build weekday candidates for a UTC range.
 * For each UTC day in range, include previous/current/next weekday to cover
 * all group timezone offsets when pre-filtering schedule days.
 */
export function buildWeekdayCandidatesForUtcRange(
  rangeStartUtcIso: string,
  rangeEndUtcIso: string,
): number[] {
  const rangeStart = fromUTC(rangeStartUtcIso, 'UTC').startOf('day');
  const rangeEnd = fromUTC(rangeEndUtcIso, 'UTC').endOf('day');
  const days = new Set<number>();

  for (
    let cursor = rangeStart;
    cursor.toMillis() <= rangeEnd.toMillis();
    cursor = cursor.plus({ days: 1 })
  ) {
    const weekday = cursor.weekday % 7;
    days.add((weekday + 6) % 7);
    days.add(weekday);
    days.add((weekday + 1) % 7);
  }

  return Array.from(days);
}

// ============================================================================
// Validation Helpers
// ============================================================================

/** Find first student ID in attendance that doesn't belong to group */
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

/** Check if originalStartedAt should be set when recording attendance early */
export function shouldSetOriginalStartedAtForAttendance(args: {
  nowUtcMillis: number;
  startedAt: Date;
  originalStartedAt?: Date | null;
}): boolean {
  return (
    args.nowUtcMillis < args.startedAt.getTime() && !args.originalStartedAt
  );
}

// ============================================================================
// Occurrence Generation (for Cron/Missed Sessions)
// ============================================================================

/** Generate all planned session occurrences for a group within date range */
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
