import { Injectable } from '@nestjs/common';
import { AddLearnersToGroupDto, CreateLearnersDto, DEFAULT_TIMEZONE } from '@halaqa/shared';
import { UserRole } from 'generated/prisma/client';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class GroupLearnerOrchestrator {
  constructor(private readonly prismaService: DatabaseService) {}

  async createLearnersAndAttachToGroup(groupId: string, dto: CreateLearnersDto): Promise<void> {
    await this.prismaService.$transaction(async (tx) => {
      const createdLearners = await Promise.all(
        dto.learners.map((learner) =>
          tx.user.create({
            data: {
              name: learner.name,
              role: UserRole.STUDENT,
              username: null,
              password: null,
              timezone: learner.timezone || DEFAULT_TIMEZONE,
              notes: learner.contact?.notes,
            },
            select: {
              id: true,
            },
          })
        )
      );

      await tx.groupStudent.createMany({
        data: createdLearners.map((learner) => ({
          groupId,
          userId: learner.id,
        })),
      });
    });
  }

  async addExistingLearnersToGroup(groupId: string, dto: AddLearnersToGroupDto): Promise<void> {
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
