import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CountDto,
  CreateLearnerDto,
  DEFAULT_TIMEZONE,
  ISODateString,
  LearnerDto,
  QueryLearnersDto,
  QueryLearnersResponseDto,
  UpdateLearnerDto,
} from '@halaqa/shared';
import { Prisma, User, UserRole } from 'generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private prismaService: DatabaseService) {}

  async findByUsername(username: string) {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });
    return user;
  }

  async delete(id: string) {
    await this.prismaService.user.delete({ where: { id } });
  }

  async createLearner(dto: CreateLearnerDto): Promise<LearnerDto> {
    const createdLearner = await this.prismaService.user.create({
      data: {
        name: dto.name,
        role: UserRole.STUDENT,
        username: null,
        password: null,
        timezone: dto.timezone ?? DEFAULT_TIMEZONE,
        notes: dto.contact?.notes,
      },
    });

    return this.toLearnerDto(createdLearner);
  }

  async queryLearners(
    query: QueryLearnersDto,
  ): Promise<QueryLearnersResponseDto> {
    const { skip, take, page } =
      this.prismaService.handleQueryPagination(query);
    const searchQuery = query.search?.trim();

    const where: Prisma.UserWhereInput = {
      role: UserRole.STUDENT,
      ...(searchQuery
        ? {
            name: {
              contains: searchQuery,
            },
          }
        : {}),
    };

    const [learners, count] = await this.prismaService.$transaction([
      this.prismaService.user.findMany({
        where,
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.user.count({ where }),
    ]);

    return {
      data: learners.map((learner) => this.toLearnerDto(learner)),
      ...this.prismaService.formatPaginationResponse({
        page,
        count,
        limit: take,
      }),
    };
  }

  async updateLearner(id: string, dto: UpdateLearnerDto): Promise<LearnerDto> {
    const learner = await this.prismaService.user.findFirst({
      where: {
        id,
        role: UserRole.STUDENT,
      },
    });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    const data: Prisma.UserUpdateInput = {};

    if (dto.name !== undefined) {
      data.name = dto.name;
    }

    if (dto.timezone !== undefined) {
      data.timezone = dto.timezone;
    }

    if (dto.contact?.notes !== undefined) {
      data.notes = dto.contact.notes;
    }

    const updatedLearner = await this.prismaService.user.update({
      where: {
        id,
      },
      data,
    });

    return this.toLearnerDto(updatedLearner);
  }

  async deleteLearner(id: string): Promise<void> {
    const deletedLearnersCount = await this.prismaService.user.deleteMany({
      where: {
        id,
        role: UserRole.STUDENT,
      },
    });

    if (deletedLearnersCount.count === 0) {
      throw new NotFoundException('Learner not found');
    }
  }

  async getTutorsCount(): Promise<number> {
    return this.prismaService.user.count({
      where: {
        role: UserRole.TUTOR,
      },
    });
  }

  async getLearnersCount(): Promise<number> {
    return this.prismaService.user.count({
      where: {
        role: UserRole.STUDENT,
      },
    });
  }

  async getLearnersCountByTutor(tutorId: string): Promise<number> {
    const learners = await this.prismaService.groupStudent.findMany({
      where: {
        group: {
          tutorId,
        },
      },
      distinct: ['userId'],
      select: {
        userId: true,
      },
    });

    return learners.length;
  }

  async getTutorsCountDto(user: User): Promise<CountDto> {
    if (user.role === UserRole.TUTOR) {
      return { count: 1 };
    }

    const count = await this.getTutorsCount();
    return { count };
  }

  async getLearnersCountDto(user: User): Promise<CountDto> {
    if (user.role !== UserRole.TUTOR) {
      const count = await this.getLearnersCount();
      return { count };
    }

    const count = await this.getLearnersCountByTutor(user.id);
    return { count };
  }

  private toLearnerDto(user: {
    id: string;
    name: string;
    role: UserRole;
    timezone: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): LearnerDto {
    return {
      id: user.id,
      name: user.name,
      role: 'STUDENT',
      timezone: user.timezone,
      contact: {
        notes: user.notes ?? undefined,
      },
      createdAt: user.createdAt.toISOString() as ISODateString,
      updatedAt: user.updatedAt.toISOString() as ISODateString,
    };
  }
}
