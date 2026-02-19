import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  combineDateTime,
  fromUTC,
  getNowAsUTC,
  getStartAndEndOfDay,
  getTodayDayOfWeek,
} from '@halaqa/shared';
import type {
  SessionDetailsDTO,
  SessionSummaryDTO,
  UpdateSessionActionDTO,
  SessionQueryDTO,
} from '@halaqa/shared';
import {
  AttendanceStatus,
  Prisma,
  SessionStatus,
  User,
  UserRole,
} from 'generated/prisma/client';
import { DatabaseService } from '../database/database.service';
import {
  buildGroupScopeWhere,
  buildPlannedStartedAtForDay,
  collectOccurrenceKeys,
  filterMissingOccurrences,
  findInvalidAttendanceStudentId,
  generatePlannedOccurrencesForRange,
  groupSessionRecordsByGroup,
  mapSessionDetails,
  mapSessionSummary,
  mapVirtualSessionDetails,
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
  constructor(private readonly prismaService: DatabaseService) {}

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  /** Get all sessions scheduled for today in user's timezone */
  async getTodaySessions(user: User): Promise<SessionSummaryDTO[]> {
    const todayDayOfWeek = getTodayDayOfWeek(user.timezone);
    const {
      startAsDatetime: dayStart,
      startAsJSDate: dayStartDate,
      endAsJSDate: dayEndDate,
    } = getStartAndEndOfDay(user.timezone);

    const groups = await this.prismaService.group.findMany({
      where: buildGroupScopeWhere(user, todayDayOfWeek),
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
          },
        },
        scheduleDays: {
          where: {
            dayOfWeek: todayDayOfWeek,
          },
          select: {
            dayOfWeek: true,
            startMinutes: true,
          },
        },
      },
    });

    if (groups.length === 0) {
      return [];
    }

    const sessionRecords = await this.prismaService.session.findMany({
      where: {
        groupId: {
          in: groups.map((group) => group.id),
        },
        OR: [
          {
            startedAt: {
              gte: dayStartDate,
              lte: dayEndDate,
            },
          },
          {
            originalStartedAt: {
              gte: dayStartDate,
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
    const dayStartUtcIso = dayStart.toUTC().toISO()!;

    const sessions = groups.map((group) => {
      const todaySchedule = group.scheduleDays[0];

      const calculatedStartedAt = buildPlannedStartedAtForDay(
        dayStartUtcIso,
        group.timezone,
        todaySchedule.startMinutes,
      );

      // Get session record for this group (if exists)
      const sessionRecord = sessionRecordsByGroup.get(group.id)?.[0] ?? null;

      // Use actual session startedAt if record exists, otherwise use calculated
      const plannedStartedAt = sessionRecord?.startedAt ?? calculatedStartedAt;

      return {
        startedAt: plannedStartedAt,
        summary: mapSessionSummary({
          groupId: group.id,
          groupName: group.name,
          tutorName: group.tutor.name,
          startedAt: plannedStartedAt,
          userTimezone: user.timezone,
          sessionRecord,
        }),
      };
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
      user.timezone,
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
        tutorName: sessionRecord.group.tutor.name,
        startedAt: sessionRecord.startedAt,
        userTimezone: user.timezone,
        sessionRecord,
      }),
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
  async getSessionDetails(
    sessionId: string,
    user: User,
  ): Promise<SessionDetailsDTO> {
    // Reuse the update-target resolver so read/write paths share the same
    // access control and occurrence-validation behavior.
    const target = await this.resolveSessionTarget(sessionId, user);

    if (target.sessionRecord) {
      return mapSessionDetails({
        sessionRecord: target.sessionRecord,
        userTimezone: user.timezone,
      });
    }

    return mapVirtualSessionDetails({
      sessionId,
      group: target.group,
      startedAt: target.startedAt,
      userTimezone: user.timezone,
    });
  }

  /** Update session - cancel, reschedule, or record attendance */
  async updateSession(
    sessionId: string,
    payload: UpdateSessionActionDTO,
    user: User,
  ): Promise<SessionDetailsDTO> {
    const target = await this.resolveSessionTarget(sessionId, user);

    switch (payload.action) {
      case 'CANCEL':
        return this.cancelSession(target, user.timezone);
      case 'RESCHEDULE':
        return this.rescheduleSession(target, payload, user.timezone);
      case 'ATTENDANCE':
        return this.recordAttendance(target, payload, user.timezone);
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

    // Get unique days of week in the time window
    const daysInWindow = new Set<number>();
    let current = lookbackUtc;
    while (current <= cutoffUtc) {
      daysInWindow.add(current.weekday % 7); // Convert to 0-6 (Sunday-Saturday)
      current = current.plus({ days: 1 });
    }

    const groups = await this.prismaService.group.findMany({
      where: {
        scheduleDays: {
          some: {
            dayOfWeek: {
              in: Array.from(daysInWindow),
            },
          },
        },
      },
      include: {
        scheduleDays: {
          where: {
            dayOfWeek: {
              in: Array.from(daysInWindow),
            },
          },
          select: {
            dayOfWeek: true,
            startMinutes: true,
          },
        },
      },
    });

    if (groups.length === 0) return;

    // Step 1: Generate all expected sessions based on each group's schedule
    // For each group, generate all session times in the time window (36h-12h ago)
    // flatMap is used because each group produces multiple sessions, and we want one flat array
    const plannedOccurrences = groups.flatMap((group) =>
      generatePlannedOccurrencesForRange(
        group,
        lookbackUtc.toISO()!,
        cutoffUtc.toISO()!,
      ).map((startedAt) => ({
        groupId: group.id,
        startedAt,
      })),
    );

    if (plannedOccurrences.length === 0) return;

    // Step 2: Fetch actual session records from database
    // Query for sessions that match the time window (check both startedAt and originalStartedAt)
    const existingSessions = await this.prismaService.session.findMany({
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
    const missedOccurrences = filterMissingOccurrences(
      plannedOccurrences,
      existingKeys,
    );

    if (missedOccurrences.length === 0) return;

    // Step 4: Create session records with MISSED status
    // Use upsert to avoid duplicates (in case of race conditions)
    await Promise.all(
      missedOccurrences.map((occurrence) =>
        this.prismaService.session.upsert({
          where: {
            groupId_startedAt: {
              groupId: occurrence.groupId,
              startedAt: occurrence.startedAt,
            },
          },
          update: { status: SessionStatus.MISSED },
          create: {
            groupId: occurrence.groupId,
            startedAt: occurrence.startedAt,
            status: SessionStatus.MISSED,
          },
        }),
      ),
    );
  }

  // ==========================================================================
  // Private Methods - Session Actions
  // ==========================================================================

  private async cancelSession(
    target: ResolvedSessionTarget,
    userTimezone: string,
  ): Promise<SessionDetailsDTO> {
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
            startedAt: target.startedAt,
            status: SessionStatus.CANCELED,
          },
          include: sessionDetailsInclude,
        });

    return mapSessionDetails({
      sessionRecord: updatedSession,
      userTimezone,
    });
  }

  private async rescheduleSession(
    target: ResolvedSessionTarget,
    payload: UpdateSessionActionDTO,
    userTimezone: string,
  ): Promise<SessionDetailsDTO> {
    if (!payload.date || !payload.time) {
      throw new BadRequestException(
        'Date and time are required for RESCHEDULE action',
      );
    }

    const newStartedAt = new Date(
      combineDateTime(payload.date, payload.time, userTimezone),
    );

    const updatedSession = target.sessionRecord
      ? await this.prismaService.session.update({
          where: {
            id: target.sessionRecord.id,
          },
          data: {
            status: SessionStatus.RESCHEDULED,
            originalStartedAt:
              target.sessionRecord.originalStartedAt ??
              target.sessionRecord.startedAt,
            startedAt: newStartedAt,
          },
          include: sessionDetailsInclude,
        })
      : await this.prismaService.session.create({
          data: {
            groupId: target.group.id,
            status: SessionStatus.RESCHEDULED,
            originalStartedAt: target.startedAt,
            startedAt: newStartedAt,
          },
          include: sessionDetailsInclude,
        });

    return mapSessionDetails({
      sessionRecord: updatedSession,
      userTimezone,
    });
  }

  private async recordAttendance(
    target: ResolvedSessionTarget,
    payload: UpdateSessionActionDTO,
    userTimezone: string,
  ): Promise<SessionDetailsDTO> {
    const attendance = payload.attendance;
    if (!attendance || attendance.length === 0) {
      throw new BadRequestException(
        'Attendance records are required for ATTENDANCE action',
      );
    }

    this.assertAttendanceStudentsBelongToGroup(
      attendance,
      new Set(target.group.students.map((item) => item.user.id)),
    );

    const updatedSession = await this.prismaService.$transaction(async (tx) => {
      const nowUtcMillis = fromUTC(getNowAsUTC(), 'UTC').toMillis();

      const sessionRecord = target.sessionRecord
        ? await this.applyAttendanceActionOnExistingSession(
            tx,
            target.sessionRecord,
            nowUtcMillis,
          )
        : await tx.session.create({
            data: {
              groupId: target.group.id,
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
          }),
        ),
      );

      return tx.session.findUniqueOrThrow({
        where: {
          id: sessionRecord.id,
        },
        include: sessionDetailsInclude,
      });
    });

    return mapSessionDetails({
      sessionRecord: updatedSession,
      userTimezone,
    });
  }

  // ==========================================================================
  // Private Methods - Helpers
  // ==========================================================================

  private async applyAttendanceActionOnExistingSession(
    tx: Prisma.TransactionClient,
    sessionRecord: SessionWithDetails,
    nowUtcMillis: number,
  ) {
    const shouldUpdateOriginalStart = shouldSetOriginalStartedAtForAttendance({
      nowUtcMillis,
      startedAt: sessionRecord.startedAt,
      originalStartedAt: sessionRecord.originalStartedAt,
    });

    if (
      shouldUpdateOriginalStart ||
      sessionRecord.status !== SessionStatus.COMPLETED
    ) {
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
      });
    }

    return sessionRecord;
  }

  /** Resolve session target from ID (handles both real and virtual sessions) */
  private async resolveSessionTarget(
    sessionId: string,
    user: User,
  ): Promise<ResolvedSessionTarget> {
    // Try finding real session record first
    const foundSession = await this.prismaService.session.findUnique({
      where: {
        id: sessionId,
      },
      include: sessionDetailsInclude,
    });

    if (foundSession) {
      this.assertTutorAccess(user, foundSession.group.tutor.id);

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
    this.assertTutorAccess(user, group.tutor.id);

    // Check if a session record was created for this virtual occurrence
    const linkedSession = await this.findLinkedSessionByOccurrence(
      parsedVirtualId.groupId,
      parsedVirtualId.startedAt,
    );

    return {
      group,
      startedAt: parsedVirtualId.startedAt,
      sessionRecord: linkedSession,
    };
  }

  private async findGroupWithDetails(
    groupId: string,
  ): Promise<GroupWithTutorStudentsAndSchedule> {
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
    startedAt: Date,
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

  private assertTutorAccess(user: User, tutorId: string) {
    if (user.role === UserRole.TUTOR && user.id !== tutorId) {
      throw new ForbiddenException('Tutor can only access own group sessions');
    }
  }

  private assertAttendanceStudentsBelongToGroup(
    attendance: UpdateSessionActionDTO['attendance'],
    groupStudentIds: Set<string>,
  ) {
    const invalidStudentId = findInvalidAttendanceStudentId(
      attendance,
      groupStudentIds,
    );

    if (!invalidStudentId) {
      return;
    }

    throw new BadRequestException(
      `Student ${invalidStudentId} does not belong to this group`,
    );
  }
}
