import { Injectable } from '@nestjs/common';
import {
  AddLearnersToGroupDto,
  CreateLearnerDto,
  DEFAULT_TIMEZONE,
} from '@halaqa/shared';
import { UserRole } from 'generated/prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GroupLearnerOrchestrator {
  constructor(private readonly prismaService: DatabaseService) {}

  async createLearnerAndAttachToGroup(
    groupId: string,
    dto: CreateLearnerDto,
  ): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const createdLearner = await tx.user.create({
        data: {
          name: dto.name,
          role: UserRole.STUDENT,
          username: null,
          password: null,
          timezone: dto.timezone || DEFAULT_TIMEZONE,
          notes: dto.contact?.notes,
        },
        select: {
          id: true,
        },
      });

      await tx.groupStudent.create({
        data: {
          groupId,
          userId: createdLearner.id,
        },
      });
    });
  }

  async addExistingLearnersToGroup(
    groupId: string,
    dto: AddLearnersToGroupDto,
  ): Promise<void> {
    const learnerIds = [...new Set(dto.learnerIds)];

    await this.prismaService.groupStudent.createMany({
      data: learnerIds.map((userId) => ({
        groupId,
        userId,
      })),
      skipDuplicates: true,
    });
  }
}
