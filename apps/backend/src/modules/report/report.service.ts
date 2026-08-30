import { Injectable, NotFoundException } from '@nestjs/common';
import type { GroupReportDTO, ReportQueryDTO } from '@halaqa/shared';
import { Prisma } from 'generated/prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ReportService {
  constructor(private readonly prismaService: DatabaseService) {}

  async getGroupReport(query: ReportQueryDTO): Promise<GroupReportDTO> {
    const group = await this.prismaService.group.findUnique({
      where: { id: query.groupId },
      include: {
        tutor: {
          select: { id: true, name: true },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const dateFilter = this.prismaService.handleDateRangeFilter(
      { fromDate: query.fromDate, toDate: query.toDate },
      group.timezone
    ) as Prisma.DateTimeFilter;

    const [learners, sessions] = await Promise.all([
      this.prismaService.groupStudent.findMany({
        where: {
          groupId: group.id,
          joinedAt: { lte: dateFilter.lte },
          OR: [{ leftAt: null }, { leftAt: { gte: dateFilter.gte } }],
        },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
        orderBy: {
          joinedAt: 'asc',
        },
      }),
      this.prismaService.session.findMany({
        where: {
          groupId: group.id,
          startedAt: dateFilter,
        },
        include: {
          attendance: {
            include: {
              user: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: {
          startedAt: 'asc',
        },
      }),
    ]);

    return {
      group: {
        id: group.id,
        name: group.name,
        timezone: group.timezone,
        status: group.status,
      },
      tutor: group.tutor ? { id: group.tutor.id, name: group.tutor.name } : null,
      learners: learners.map((groupStudent) => ({
        id: groupStudent.user.id,
        name: groupStudent.user.name,
        joinedAt:
          groupStudent.joinedAt.toISOString() as GroupReportDTO['learners'][number]['joinedAt'],
        leftAt: groupStudent.leftAt
          ? (groupStudent.leftAt.toISOString() as NonNullable<
              GroupReportDTO['learners'][number]['leftAt']
            >)
          : null,
      })),
      sessions: sessions.map((sessionRecord) => ({
        id: sessionRecord.id,
        startedAt:
          sessionRecord.startedAt.toISOString() as GroupReportDTO['sessions'][number]['startedAt'],
        status: sessionRecord.status,
        attendance: sessionRecord.attendance.map((attendanceRecord) => ({
          studentId: attendanceRecord.user.id,
          studentName: attendanceRecord.user.name,
          status: attendanceRecord.status,
          notes: attendanceRecord.notes ?? undefined,
        })),
      })),
      period: {
        fromDate: query.fromDate,
        toDate: query.toDate,
      },
    };
  }
}
