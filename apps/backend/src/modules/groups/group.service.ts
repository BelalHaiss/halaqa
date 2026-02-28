import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  CountDto,
  CreateGroupDto,
  GroupDetailsDto,
  GroupSelectOptionDto,
  GroupSummaryDto,
  GroupTutorSummaryDto,
  ISODateString,
  UpdateGroupDto,
  UpdateGroupSettingsDto,
} from '@halaqa/shared';
import { UserRole } from 'generated/prisma/client';
import type { Prisma, User } from 'generated/prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GroupService {
  constructor(private readonly prismaService: DatabaseService) {}

  private getScopedGroupWhere(user: User): Prisma.GroupWhereInput {
    if (user.role === UserRole.TUTOR) {
      return { tutorId: user.id };
    }

    return {};
  }

  private async findGroupDetailsOrThrow(groupId: string, user?: User): Promise<GroupDetailsDto> {
    const whereClause: Prisma.GroupWhereUniqueInput = {
      id: groupId,
    };
    if (user?.role === UserRole.TUTOR) {
      whereClause.tutorId = user.id;
    }
    const group = await this.prismaService.group.findUnique({
      where: whereClause,
      include: {
        tutor: {
          select: {
            id: true,
            name: true,
          },
        },
        scheduleDays: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        students: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                timezone: true,
                notes: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException('Group not found');
    }

    return {
      id: group.id,
      name: group.name,
      description: group.description ?? undefined,
      tutorId: group.tutorId,
      tutor: group.tutor
        ? {
            id: group.tutor.id,
            name: group.tutor.name,
          }
        : null,
      timezone: group.timezone,
      status: group.status,
      scheduleDays: group.scheduleDays.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        startMinutes: day.startMinutes,
        durationMinutes: day.durationMinutes,
      })),
      students: group.students.map((student) => ({
        id: student.user.id,
        name: student.user.name,
        timezone: student.user.timezone,
        notes: student.user.notes ?? undefined,
      })),
      createdAt: group.createdAt.toISOString() as ISODateString,
      updatedAt: group.updatedAt.toISOString() as ISODateString,
    };
  }

  async getGroups(user: User): Promise<GroupSummaryDto[]> {
    const groups = await this.prismaService.group.findMany({
      where: this.getScopedGroupWhere(user),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        scheduleDays: {
          orderBy: {
            dayOfWeek: 'asc',
          },
        },
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return groups.map((group) => ({
      id: group.id,
      name: group.name,
      description: group.description ?? undefined,
      tutorId: group.tutorId,
      timezone: group.timezone,
      status: group.status,
      scheduleDays: group.scheduleDays.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        startMinutes: day.startMinutes,
        durationMinutes: day.durationMinutes,
      })),
      studentsCount: group._count.students,
      createdAt: group.createdAt.toISOString() as ISODateString,
      updatedAt: group.updatedAt.toISOString() as ISODateString,
    }));
  }

  async getTutors(): Promise<GroupTutorSummaryDto[]> {
    const tutors = await this.prismaService.user.findMany({
      where: {
        role: UserRole.TUTOR,
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    return tutors.map((tutor) => ({
      id: tutor.id,
      name: tutor.name,
    }));
  }

  async getGroupOptions(user: User): Promise<GroupSelectOptionDto[]> {
    const groups = await this.prismaService.group.findMany({
      where: this.getScopedGroupWhere(user),
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
      },
    });

    return groups.map((group) => ({
      name: group.name,
      value: group.id,
    }));
  }

  async getGroupById(groupId: string, user: User): Promise<GroupDetailsDto> {
    return this.findGroupDetailsOrThrow(groupId, user);
  }

  async createGroup(dto: CreateGroupDto): Promise<GroupDetailsDto> {
    const tutor = await this.prismaService.user.findUnique({
      where: { id: dto.tutorId },
      select: {
        id: true,
        role: true,
      },
    });

    if (!tutor || tutor.role !== UserRole.TUTOR) {
      throw new BadRequestException('Tutor not found');
    }

    const group = await this.prismaService.group.create({
      data: {
        name: dto.name,
        description: dto.description,
        tutorId: dto.tutorId,
        timezone: dto.timezone,
        status: dto.status ?? 'ACTIVE',
        scheduleDays: {
          createMany: {
            data: dto.scheduleDays.map((day) => ({
              dayOfWeek: day.dayOfWeek,
              startMinutes: day.startMinutes,
              durationMinutes: day.durationMinutes,
            })),
          },
        },
      },
    });

    return this.findGroupDetailsOrThrow(group.id);
  }

  async updateGroup(groupId: string, dto: UpdateGroupDto): Promise<GroupDetailsDto> {
    // Validate tutor if tutorId is being updated
    if (dto.tutorId) {
      const tutor = await this.prismaService.user.findUnique({
        where: { id: dto.tutorId },
        select: {
          id: true,
          role: true,
        },
      });

      if (!tutor || tutor.role !== UserRole.TUTOR) {
        throw new BadRequestException('Tutor not found');
      }
    }

    await this.prismaService.$transaction(async (tx) => {
      // Update group basic fields
      await tx.group.update({
        where: { id: groupId },
        data: {
          name: dto.name,
          description: dto.description,
          tutorId: dto.tutorId,
          timezone: dto.timezone,
          status: dto.status,
        },
      });

      // Update schedule days if provided
      if (dto.scheduleDays) {
        await tx.groupScheduleDay.deleteMany({
          where: { groupId },
        });

        await tx.groupScheduleDay.createMany({
          data: dto.scheduleDays.map((day) => ({
            groupId,
            dayOfWeek: day.dayOfWeek,
            startMinutes: day.startMinutes,
            durationMinutes: day.durationMinutes,
          })),
        });
      }
    });

    return this.findGroupDetailsOrThrow(groupId);
  }

  async updateGroupSettings(
    groupId: string,
    dto: UpdateGroupSettingsDto
  ): Promise<GroupDetailsDto> {
    await this.prismaService.$transaction(async (tx) => {
      await tx.group.update({
        where: { id: groupId },
        data: {
          status: dto.status,
        },
      });

      if (dto.scheduleDays) {
        await tx.groupScheduleDay.deleteMany({
          where: { groupId },
        });

        await tx.groupScheduleDay.createMany({
          data: dto.scheduleDays.map((day) => ({
            groupId,
            dayOfWeek: day.dayOfWeek,
            startMinutes: day.startMinutes,
            durationMinutes: day.durationMinutes,
          })),
        });
      }
    });

    return this.findGroupDetailsOrThrow(groupId);
  }

  async removeStudentFromGroup(groupId: string, userId: string): Promise<void> {
    await this.prismaService.groupStudent.deleteMany({
      where: {
        groupId,
        userId,
      },
    });
  }

  async getGroupsCount(user: User): Promise<CountDto> {
    const count = await this.prismaService.group.count({
      where: this.getScopedGroupWhere(user),
    });

    return { count };
  }
}
