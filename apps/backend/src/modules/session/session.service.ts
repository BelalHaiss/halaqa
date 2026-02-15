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
  getEndOfDay,
  getNowAsUTC,
  getStartOfDay,
  getTodayDayOfWeek,
} from '@halaqa/shared';
import type {
  SessionDetailsDTO,
  SessionSummaryDTO,
  UpdateSessionActionDTO,
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
  findSessionRecordForOccurrence,
  generatePlannedOccurrencesForRange,
  groupSessionRecordsByGroup,
  mapSessionDetails,
  mapSessionSummary,
  mapVirtualSessionDetails,
  occurrenceMatchesGroupSchedule,
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

  async getTodaySessions(user: User): Promise<SessionSummaryDTO[]> {
    const todayDayOfWeek = getTodayDayOfWeek(user.timezone);
    const dayStartUtcIso = getStartOfDay(user.timezone);
    const dayEndUtcIso = getEndOfDay(user.timezone);
    const dayStartUtcDate = new Date(dayStartUtcIso);
    const dayEndUtcDate = new Date(dayEndUtcIso);

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
              gte: dayStartUtcDate,
              lte: dayEndUtcDate,
            },
          },
          {
            originalStartedAt: {
              gte: dayStartUtcDate,
              lte: dayEndUtcDate,
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

    return groups
      .flatMap((group) => {
        const todaySchedule = group.scheduleDays[0];
        if (!todaySchedule) {
          return [];
        }

        const plannedStartedAt = buildPlannedStartedAtForDay(
          dayStartUtcIso,
          group.timezone,
          todaySchedule.startMinutes,
        );
        // Prioritize original start matching so rescheduled sessions still map
        // to their planned slot in the day view.
        const sessionRecord = findSessionRecordForOccurrence(
          sessionRecordsByGroup.get(group.id) ?? [],
          plannedStartedAt,
        );

        return [
          {
            startedAt: plannedStartedAt,
            summary: mapSessionSummary({
              groupId: group.id,
              groupName: group.name,
              tutorName: group.tutor.name,
              startedAt: plannedStartedAt,
              userTimezone: user.timezone,
              sessionRecord,
            }),
          },
        ];
      })
      .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
      .map((item) => item.summary);
  }

  async getSessionsHistory(user: User): Promise<SessionSummaryDTO[]> {
    const todayStartUtcIso = getStartOfDay(user.timezone);
    const where: Prisma.SessionWhereInput = {
      startedAt: {
        lt: new Date(todayStartUtcIso),
      },
    };

    if (user.role === UserRole.TUTOR) {
      where.group = {
        tutorId: user.id,
      };
    }

    const sessions = await this.prismaService.session.findMany({
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
    });

    return sessions.map((sessionRecord) =>
      mapSessionSummary({
        groupId: sessionRecord.groupId,
        groupName: sessionRecord.group.name,
        tutorName: sessionRecord.group.tutor.name,
        startedAt: sessionRecord.startedAt,
        userTimezone: user.timezone,
        sessionRecord,
      }),
    );
  }

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

  @Cron(CronExpression.EVERY_2_HOURS)
  async markMissedSessions(): Promise<void> {
    const groups = await this.prismaService.group.findMany({
      include: {
        scheduleDays: {
          select: {
            dayOfWeek: true,
            startMinutes: true,
          },
        },
      },
    });

    if (groups.length === 0) {
      return;
    }

    const nowUtc = fromUTC(getNowAsUTC(), 'UTC');
    const cutoffUtc = nowUtc.minus({ hours: 12 });
    const oldestGroupCreatedAt = groups.reduce(
      (oldest, currentGroup) =>
        currentGroup.createdAt < oldest ? currentGroup.createdAt : oldest,
      groups[0].createdAt,
    );
    const lookbackStartUtc = fromUTC(
      oldestGroupCreatedAt.toISOString(),
      'UTC',
    ).startOf('day');

    const plannedOccurrences = groups.flatMap((group) =>
      generatePlannedOccurrencesForRange(
        group,
        lookbackStartUtc.toISO()!,
        cutoffUtc.toISO()!,
      ).map((startedAt) => ({
        groupId: group.id,
        startedAt,
      })),
    );

    if (plannedOccurrences.length === 0) {
      return;
    }

    const existingSessions = await this.prismaService.session.findMany({
      where: {
        groupId: {
          in: groups.map((group) => group.id),
        },
        OR: [
          {
            startedAt: {
              gte: lookbackStartUtc.toJSDate(),
              lte: cutoffUtc.toJSDate(),
            },
          },
          {
            originalStartedAt: {
              gte: lookbackStartUtc.toJSDate(),
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

    const existingKeys = collectOccurrenceKeys(existingSessions);
    const missingOccurrences = filterMissingOccurrences(
      plannedOccurrences,
      existingKeys,
    );

    if (missingOccurrences.length === 0) {
      return;
    }

    await Promise.all(
      missingOccurrences.map((occurrence) =>
        this.prismaService.session.upsert({
          where: {
            groupId_startedAt: {
              groupId: occurrence.groupId,
              startedAt: occurrence.startedAt,
            },
          },
          update: {
            status: SessionStatus.MISSED,
          },
          create: {
            groupId: occurrence.groupId,
            startedAt: occurrence.startedAt,
            status: SessionStatus.MISSED,
          },
        }),
      ),
    );
  }

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

  private async resolveSessionTarget(
    sessionId: string,
    user: User,
  ): Promise<ResolvedSessionTarget> {
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

    const parsedVirtualId = parseVirtualSessionId(sessionId);
    if (!parsedVirtualId) {
      throw new NotFoundException('Session not found');
    }

    const group = await this.findGroupWithDetails(parsedVirtualId.groupId);
    this.assertTutorAccess(user, group.tutor.id);
    this.assertOccurrenceBelongsToGroupSchedule(
      group,
      parsedVirtualId.startedAt,
    );

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

  private assertOccurrenceBelongsToGroupSchedule(
    group: GroupWithTutorStudentsAndSchedule,
    occurrenceStartedAt: Date,
  ) {
    if (
      occurrenceMatchesGroupSchedule(
        occurrenceStartedAt,
        group.timezone,
        group.scheduleDays,
      )
    ) {
      return;
    }

    throw new NotFoundException('Session occurrence does not exist');
  }
}
