import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { combineDateTime, fromUTC, getNowAsUTC, getStartAndEndOfDay } from '@halaqa/shared';
import type {
  SessionDetailsDTO,
  SessionSummaryDTO,
  UpdateSessionActionDTO,
  SessionQueryDTO,
} from '@halaqa/shared';
import {
  AttendanceStatus,
  GroupStatus,
  Prisma,
  SessionStatus,
  User,
  UserRole,
} from 'generated/prisma/client';
import { DatabaseService } from '../database/database.service';
import { LearnerAttendanceCountService } from '../payments/learner-attendance-count.service';
import {
  buildGroupScopeWhere,
  buildWeekdayCandidatesForUtcRange,
  collectOccurrenceKeys,
  filterMissingOccurrences,
  findInvalidAttendanceStudentId,
  generatePlannedOccurrencesForRange,
  groupSessionRecordsByGroup,
  mapSessionDetails,
  mapSessionSummary,
  mapVirtualSessionDetails,
  MISSED_THRESHOLD_HOURS,
  parseVirtualSessionId,
  shouldSetOriginalStartedAtForAttendance,
} from './session.util';

const sessionDetailsInclude = {
  group: {
    include: {
      tutor: {
        select: {
          id: true,
          name: true,
        },
      },
      students: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      scheduleDays: {
        select: {
          dayOfWeek: true,
          startMinutes: true,
          durationMinutes: true,
        },
      },
    },
  },
  attendance: {
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
} satisfies Prisma.SessionInclude;

type SessionWithDetails = Prisma.SessionGetPayload<{
  include: typeof sessionDetailsInclude;
}>;

type GroupWithTutorStudentsAndSchedule = Prisma.GroupGetPayload<{
  include: {
    tutor: {
      select: {
        id: true;
        name: true;
      };
    };
    students: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
    scheduleDays: {
      select: {
        dayOfWeek: true;
        startMinutes: true;
        durationMinutes: true;
      };
    };
  };
}>;

type ResolvedSessionTarget = {
  group: GroupWithTutorStudentsAndSchedule;
  startedAt: Date;
  sessionRecord: SessionWithDetails | null;
};

@Injectable()
export class SessionService {
  constructor(
    private readonly prismaService: DatabaseService,
    private readonly learnerAttendanceCountService: LearnerAttendanceCountService
  ) {}

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  /** Get all sessions scheduled for today in user's timezone.
   *
   * Extends the query window backwards by MISSED_THRESHOLD_HOURS so that
   * late-night sessions (e.g. 11:40 PM) remain visible after midnight until
   * they are explicitly resolved or the cron processes them into MISSED records.
   * Sessions from the lookback window that are already resolved (COMPLETED,
   * CANCELED, RESCHEDULED) are excluded — only unresolved ones are surfaced.
   */
  async getTodaySessions(user: User): Promise<SessionSummaryDTO[]> {
    const {
      endAsDatetime: dayEnd,
      startAsJSDate: dayStartDate,
      endAsJSDate: dayEndDate,
    } = getStartAndEndOfDay(user.timezone);

    const dayEndUtcIso = dayEnd.toUTC().toISO()!;

    // Extend backwards so sessions near midnight aren't lost after the day rolls over
    const extendedStartDate = new Date(
      dayStartDate.getTime() - MISSED_THRESHOLD_HOURS * 60 * 60 * 1000
    );
    const extendedStartUtcIso = extendedStartDate.toISOString();

    const weekdayCandidates = buildWeekdayCandidatesForUtcRange(extendedStartUtcIso, dayEndUtcIso);

    const groups = await this.prismaService.group.findMany({
      where: {
        ...buildGroupScopeWhere(user),
        scheduleDays: {
          some: {
            dayOfWeek: {
              in: weekdayCandidates,
            },
          },
        },
      },
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
          },
        },
        scheduleDays: {
          where: {
            dayOfWeek: {
              in: weekdayCandidates,
            },
          },
          select: {
            dayOfWeek: true,
            startMinutes: true,
            durationMinutes: true,
          },
        },
      },
    });

    if (groups.length === 0) {
      return [];
    }

    const plannedOccurrences = groups.flatMap((group) =>
      generatePlannedOccurrencesForRange(group, extendedStartUtcIso, dayEndUtcIso).map(
        (startedAt) => ({
          groupId: group.id,
          startedAt,
        })
      )
    );

    if (plannedOccurrences.length === 0) {
      return [];
    }

    const sessionRecords = await this.prismaService.session.findMany({
      where: {
        groupId: {
          in: Array.from(new Set(plannedOccurrences.map((occurrence) => occurrence.groupId))),
        },
        OR: [
          {
            startedAt: {
              gte: extendedStartDate,
              lte: dayEndDate,
            },
          },
          {
            originalStartedAt: {
              gte: extendedStartDate,
              lte: dayEndDate,
            },
          },
        ],
      },
      select: {
        id: true,
        groupId: true,
        startedAt: true,
        originalStartedAt: true,
        status: true,
      },
    });

    const sessionRecordsByGroup = groupSessionRecordsByGroup(sessionRecords);
    const groupsById = new Map(groups.map((group) => [group.id, group]));

    const seenSessionIds = new Set<string>();

    const sessions = plannedOccurrences
      .map((occurrence) => {
        const group = groupsById.get(occurrence.groupId);
        if (!group) {
          return null;
        }

        // Match both planned and rescheduled records for the occurrence.
        const sessionRecord =
          sessionRecordsByGroup.get(occurrence.groupId)?.find((record) => {
            const occurrenceIso = occurrence.startedAt.toISOString();
            return (
              record.startedAt.toISOString() === occurrenceIso ||
              record.originalStartedAt?.toISOString() === occurrenceIso
            );
          }) ?? null;
        const startedAt = sessionRecord?.startedAt ?? occurrence.startedAt;

        return {
          startedAt,
          summary: mapSessionSummary({
            groupId: group.id,
            groupName: group.name,
            tutorName: group.tutor?.name ?? null,
            startedAt,
            sessionRecord,
          }),
        };
      })
      .filter((session): session is NonNullable<typeof session> => {
        if (!session) return false;

        // Deduplicate: a RESCHEDULED record can be matched by both the original
        // slot (via originalStartedAt) and the new slot (via startedAt) when
        // both fall within the extended query range. Keep the first encounter.
        if (seenSessionIds.has(session.summary.id)) return false;
        seenSessionIds.add(session.summary.id);

        // Sessions within the lookback window (before today's midnight) are only
        // surfaced when unresolved — resolved ones already belong to history.
        const isInLookback = session.startedAt.getTime() < dayStartDate.getTime();
        if (isInLookback) {
          const status = session.summary.sessionStatus;
          return status === 'SCHEDULED' || status === 'MISSED';
        }

        return true;
      });

    sessions.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());

    return sessions.map((session) => session.summary);
  }

  /** Query sessions with filters and pagination */
  async querySessions(query: SessionQueryDTO, user: User) {
    // Build base where clause with user scope
    const where: Prisma.SessionWhereInput = {};

    if (user.role === UserRole.TUTOR) {
      where.group = {
        tutorId: user.id,
      };
    }

    // Apply date range filter
    const dateFilter = this.prismaService.handleDateRangeFilter(
      { fromDate: query.fromDate, toDate: query.toDate },
      user.timezone
    );
    if (dateFilter) {
      where.startedAt = dateFilter;
    }

    // Apply status filter
    if (query.status) {
      where.status = query.status as SessionStatus;
    }

    // Apply group filter
    if (query.groupId) {
      where.groupId = query.groupId;
    }

    // Get pagination params
    const { skip, take, page } = this.prismaService.handleQueryPagination({
      page: query.page,
      limit: query.limit,
    });

    // Execute query with count for pagination
    const [sessions, count] = await Promise.all([
      this.prismaService.session.findMany({
        where,
        include: {
          group: {
            select: {
              id: true,
              name: true,
              tutor: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          startedAt: 'desc',
        },
        skip,
        take,
      }),
      this.prismaService.session.count({ where }),
    ]);

    // Map to SessionSummaryDTO
    const data = sessions.map((sessionRecord) =>
      mapSessionSummary({
        groupId: sessionRecord.groupId,
        groupName: sessionRecord.group.name,
        tutorName: sessionRecord.group.tutor?.name ?? null,
        startedAt: sessionRecord.startedAt,
        sessionRecord,
      })
    );

    // Return with pagination metadata
    return {
      data,
      ...this.prismaService.formatPaginationResponse({
        page,
        count,
        limit: take,
      }),
    };
  }

  /** Get detailed session info for a specific session */
  async getSessionDetails(sessionId: string, user: User): Promise<SessionDetailsDTO> {
    // Reuse the update-target resolver so read/write paths share the same
    // access control and occurrence-validation behavior.
    const target = await this.resolveSessionTarget(sessionId, user);

    if (target.sessionRecord) {
      return mapSessionDetails({
        sessionRecord: target.sessionRecord,
      });
    }

    return mapVirtualSessionDetails({
      sessionId,
      group: target.group,
      startedAt: target.startedAt,
    });
  }

  /** Update session - cancel, reschedule, or record attendance */
  async updateSession(
    sessionId: string,
    payload: UpdateSessionActionDTO,
    user: User
  ): Promise<SessionDetailsDTO> {
    const target = await this.resolveSessionTarget(sessionId, user);

    switch (payload.action) {
      case 'CANCEL':
        return this.cancelSession(target);
      case 'RESCHEDULE':
        return this.rescheduleSession(target, payload, target.group.timezone);
      case 'ATTENDANCE':
        return this.recordAttendance(target, payload);
      default:
        throw new BadRequestException('Invalid action');
    }
  }

  /** Cron job: Mark sessions as MISSED if not acted upon within threshold */
  @Cron(CronExpression.EVERY_2_HOURS)
  async markMissedSessions(): Promise<void> {
    const nowUtc = fromUTC(getNowAsUTC(), 'UTC');
    const cutoffUtc = nowUtc.minus({ hours: 12 }); // Sessions older than 12h
    const lookbackUtc = nowUtc.minus({ hours: 36 }); // Fixed lookback window
    const weekdayCandidates = buildWeekdayCandidatesForUtcRange(
      lookbackUtc.toISO()!,
      cutoffUtc.toISO()!
    );

    await this.prismaService.$transaction(async (tx) => {
      const groups = await tx.group.findMany({
        where: {
          status: GroupStatus.ACTIVE,
          createdAt: {
            lte: cutoffUtc.toJSDate(),
          },
          scheduleDays: {
            some: {
              dayOfWeek: {
                in: weekdayCandidates,
              },
            },
          },
        },
        include: {
          scheduleDays: {
            where: {
              dayOfWeek: {
                in: weekdayCandidates,
              },
            },
            select: {
              dayOfWeek: true,
              startMinutes: true,
              durationMinutes: true,
            },
          },
        },
      });

      if (groups.length === 0) return;

      // Step 1: Generate all expected sessions based on each group's schedule
      // For each group, generate all session times in the time window (36h-12h ago)
      // flatMap is used because each group produces multiple sessions, and we want one flat array
      const cutoffUtcIso = cutoffUtc.toISO()!;
      const lookbackUtcMillis = lookbackUtc.toMillis();
      const cutoffUtcMillis = cutoffUtc.toMillis();
      const plannedOccurrences = groups.flatMap((group) => {
        const groupRangeStartUtc = new Date(Math.max(lookbackUtcMillis, group.createdAt.getTime()));

        if (groupRangeStartUtc.getTime() > cutoffUtcMillis) {
          return [];
        }

        return generatePlannedOccurrencesForRange(
          group,
          groupRangeStartUtc.toISOString(),
          cutoffUtcIso
        ).map((startedAt) => ({
          groupId: group.id,
          startedAt,
        }));
      });

      if (plannedOccurrences.length === 0) return;

      // Step 2: Fetch actual session records from database
      // Query for sessions that match the time window (check both startedAt and originalStartedAt)
      const existingSessions = await tx.session.findMany({
        where: {
          groupId: { in: groups.map((g) => g.id) },
          OR: [
            {
              startedAt: {
                gte: lookbackUtc.toJSDate(),
                lte: cutoffUtc.toJSDate(),
              },
            },
            {
              originalStartedAt: {
                gte: lookbackUtc.toJSDate(),
                lte: cutoffUtc.toJSDate(),
              },
            },
          ],
        },
        select: {
          groupId: true,
          startedAt: true,
          originalStartedAt: true,
        },
      });

      // Step 3: Compare planned vs actual to find missing sessions
      // Create a set of "groupId:timestamp" keys for fast lookup
      const existingKeys = collectOccurrenceKeys(existingSessions);
      // Filter out planned occurrences that already have records
      const missedOccurrences = filterMissingOccurrences(plannedOccurrences, existingKeys);

      if (missedOccurrences.length === 0) return;

      const groupsById = new Map(groups.map((group) => [group.id, group]));

      // Step 4: Create session records with MISSED status
      // Use upsert to avoid duplicates (in case of race conditions)
      const upserts = missedOccurrences.flatMap((occurrence) => {
        const group = groupsById.get(occurrence.groupId);

        if (!group?.tutorId) {
          return [];
        }

        const localDay = fromUTC(occurrence.startedAt.toISOString(), group.timezone);
        const dayOfWeek = localDay.weekday === 7 ? 0 : localDay.weekday;
        const scheduleDay = group.scheduleDays.find((d) => d.dayOfWeek === dayOfWeek);
        const durationMinutes = scheduleDay?.durationMinutes ?? 0;
        const tutorSessionPrice = group.tutorHourlyRate
          ? group.tutorHourlyRate.mul(durationMinutes).div(60)
          : null;

        return tx.session.upsert({
          where: {
            groupId_startedAt: {
              groupId: occurrence.groupId,
              startedAt: occurrence.startedAt,
            },
          },
          update: { status: SessionStatus.MISSED },
          create: {
            groupId: occurrence.groupId,
            tutorId: group.tutorId,
            tutorSessionPrice,
            tutorCurrency: group.tutorCurrency,
            startedAt: occurrence.startedAt,
            status: SessionStatus.MISSED,
          },
        });
      });

      await Promise.all(upserts);
    });
  }

  // ==========================================================================
  // Private Methods - Session Actions
  // ==========================================================================

  private async cancelSession(target: ResolvedSessionTarget): Promise<SessionDetailsDTO> {
    const tutorSnapshot = this.getSessionTutorSnapshot(target.group, target.startedAt);

    const updatedSession = target.sessionRecord
      ? await this.prismaService.session.update({
          where: {
            id: target.sessionRecord.id,
          },
          data: {
            status: SessionStatus.CANCELED,
          },
          include: sessionDetailsInclude,
        })
      : await this.prismaService.session.create({
          data: {
            groupId: target.group.id,
            ...tutorSnapshot,
            startedAt: target.startedAt,
            status: SessionStatus.CANCELED,
          },
          include: sessionDetailsInclude,
        });

    return mapSessionDetails({
      sessionRecord: updatedSession,
    });
  }

  private async rescheduleSession(
    target: ResolvedSessionTarget,
    payload: UpdateSessionActionDTO,
    groupTimezone: string
  ): Promise<SessionDetailsDTO> {
    const newStartedAt = new Date(combineDateTime(payload.date!, payload.time!, groupTimezone));
    const tutorSnapshot = this.getSessionTutorSnapshot(target.group, target.startedAt);

    const updatedSession = target.sessionRecord
      ? await this.prismaService.session.update({
          where: {
            id: target.sessionRecord.id,
          },
          data: {
            status: SessionStatus.RESCHEDULED,
            originalStartedAt:
              target.sessionRecord.originalStartedAt ?? target.sessionRecord.startedAt,
            startedAt: newStartedAt,
          },
          include: sessionDetailsInclude,
        })
      : await this.prismaService.session.create({
          data: {
            groupId: target.group.id,
            ...tutorSnapshot,
            status: SessionStatus.RESCHEDULED,
            originalStartedAt: target.startedAt,
            startedAt: newStartedAt,
          },
          include: sessionDetailsInclude,
        });

    return mapSessionDetails({
      sessionRecord: updatedSession,
    });
  }

  private async recordAttendance(
    target: ResolvedSessionTarget,
    payload: UpdateSessionActionDTO
  ): Promise<SessionDetailsDTO> {
    const attendance = payload.attendance;
    if (!attendance || attendance.length === 0) {
      throw new BadRequestException('Attendance records are required for ATTENDANCE action');
    }

    this.assertAttendanceStudentsBelongToGroup(
      attendance,
      new Set(target.group.students.map((item) => item.user.id))
    );

    const updatedSession = await this.prismaService.$transaction(async (tx) => {
      const nowUtcMillis = fromUTC(getNowAsUTC(), 'UTC').toMillis();
      const tutorSnapshot = this.getSessionTutorSnapshot(target.group, target.startedAt);

      const sessionRecord = target.sessionRecord
        ? await this.applyAttendanceActionOnExistingSession(tx, target.sessionRecord, nowUtcMillis)
        : await tx.session.create({
            data: {
              groupId: target.group.id,
              ...tutorSnapshot,
              status: SessionStatus.COMPLETED,
              // If attendance is captured before planned start, keep that start
              // as original occurrence metadata for later traceability.
              originalStartedAt: shouldSetOriginalStartedAtForAttendance({
                nowUtcMillis,
                startedAt: target.startedAt,
              })
                ? target.startedAt
                : null,
              startedAt: target.startedAt,
            },
          });

      await Promise.all(
        attendance.map((attendanceItem) =>
          tx.attendanceRecord.upsert({
            where: {
              sessionId_userId: {
                sessionId: sessionRecord.id,
                userId: attendanceItem.studentId,
              },
            },
            update: {
              status: attendanceItem.status as AttendanceStatus,
              notes: attendanceItem.notes,
            },
            create: {
              sessionId: sessionRecord.id,
              userId: attendanceItem.studentId,
              status: attendanceItem.status as AttendanceStatus,
              notes: attendanceItem.notes,
            },
          })
        )
      );

      await this.learnerAttendanceCountService.syncAttendedCount(tx, {
        groupBillingType: target.group.billingType,
        attendanceRecords: attendance.map((a) => ({
          userId: a.studentId,
          status: a.status,
        })),
      });

      return tx.session.findUniqueOrThrow({
        where: {
          id: sessionRecord.id,
        },
        include: sessionDetailsInclude,
      });
    });

    return mapSessionDetails({
      sessionRecord: updatedSession,
    });
  }

  // ==========================================================================
  // Private Methods - Helpers
  // ==========================================================================

  private async applyAttendanceActionOnExistingSession(
    tx: Prisma.TransactionClient,
    sessionRecord: SessionWithDetails,
    nowUtcMillis: number
  ) {
    const shouldUpdateOriginalStart = shouldSetOriginalStartedAtForAttendance({
      nowUtcMillis,
      startedAt: sessionRecord.startedAt,
      originalStartedAt: sessionRecord.originalStartedAt,
    });

    if (shouldUpdateOriginalStart || sessionRecord.status !== SessionStatus.COMPLETED) {
      return tx.session.update({
        where: {
          id: sessionRecord.id,
        },
        data: {
          status: SessionStatus.COMPLETED,
          ...(shouldUpdateOriginalStart
            ? {
                originalStartedAt: sessionRecord.startedAt,
                startedAt: sessionRecord.startedAt,
              }
            : {}),
        },
        include: sessionDetailsInclude,
      });
    }

    return sessionRecord;
  }

  /** Resolve session target from ID (handles both real and virtual sessions) */
  private async resolveSessionTarget(
    sessionId: string,
    user: User
  ): Promise<ResolvedSessionTarget> {
    // Try finding real session record first
    const foundSession = await this.prismaService.session.findUnique({
      where: {
        id: sessionId,
      },
      include: sessionDetailsInclude,
    });

    if (foundSession) {
      this.assertTutorAccess(user, foundSession.group.tutorId);

      return {
        group: foundSession.group,
        startedAt: foundSession.startedAt,
        sessionRecord: foundSession,
      };
    }

    // If not found, parse as virtual session ID
    const parsedVirtualId = parseVirtualSessionId(sessionId);
    if (!parsedVirtualId) {
      throw new NotFoundException('Session not found');
    }

    const group = await this.findGroupWithDetails(parsedVirtualId.groupId);
    this.assertTutorAccess(user, group.tutorId);

    // Check if a session record was created for this virtual occurrence
    const linkedSession = await this.findLinkedSessionByOccurrence(
      parsedVirtualId.groupId,
      parsedVirtualId.startedAt
    );

    return {
      group,
      startedAt: parsedVirtualId.startedAt,
      sessionRecord: linkedSession,
    };
  }

  private async findGroupWithDetails(groupId: string): Promise<GroupWithTutorStudentsAndSchedule> {
    const group = await this.prismaService.group.findUnique({
      where: {
        id: groupId,
      },
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
          },
        },
        students: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        scheduleDays: {
          select: {
            dayOfWeek: true,
            startMinutes: true,
            durationMinutes: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return group;
  }

  private async findLinkedSessionByOccurrence(
    groupId: string,
    startedAt: Date
  ): Promise<SessionWithDetails | null> {
    return this.prismaService.session.findFirst({
      where: {
        groupId,
        OR: [
          {
            startedAt,
          },
          {
            originalStartedAt: startedAt,
          },
        ],
      },
      include: sessionDetailsInclude,
    });
  }

  private assertTutorAccess(user: User, tutorId: string | null) {
    if (user.role === UserRole.TUTOR && user.id !== tutorId) {
      throw new ForbiddenException('Tutor can only access own group sessions');
    }
  }

  private getSessionTutorSnapshot(group: GroupWithTutorStudentsAndSchedule, startedAt: Date) {
    if (!group.tutorId) {
      throw new BadRequestException(`Group ${group.id} has no assigned tutor`);
    }

    const localDay = fromUTC(startedAt.toISOString(), group.timezone);
    const dayOfWeek = localDay.weekday === 7 ? 0 : localDay.weekday;
    const scheduleDay = group.scheduleDays.find((d) => d.dayOfWeek === dayOfWeek);
    const durationMinutes = scheduleDay?.durationMinutes ?? 0;
    const tutorSessionPrice = group.tutorHourlyRate
      ? group.tutorHourlyRate.mul(durationMinutes).div(60)
      : null;

    return {
      tutorId: group.tutorId,
      tutorSessionPrice,
      tutorCurrency: group.tutorCurrency,
    };
  }

  private assertAttendanceStudentsBelongToGroup(
    attendance: UpdateSessionActionDTO['attendance'],
    groupStudentIds: Set<string>
  ) {
    const invalidStudentId = findInvalidAttendanceStudentId(attendance, groupStudentIds);

    if (!invalidStudentId) {
      return;
    }

    throw new BadRequestException(`Student ${invalidStudentId} does not belong to this group`);
  }
}
