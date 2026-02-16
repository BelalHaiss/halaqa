import { Injectable } from '@nestjs/common';
import { CreateLearnerDto, DEFAULT_TIMEZONE } from '@halaqa/shared';
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
          role: true,
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
}
